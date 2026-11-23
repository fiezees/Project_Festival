const fs = require('fs');
const path = require('path');
const pool = require('../db');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

/**
 * Ensure the backups directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Helper to escape SQL string values
 */
function escapeSqlVal(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (val instanceof Date) {
    return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
  }
  const str = String(val)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
  return `'${str}'`;
}

/**
 * Rotates backups: keeps the latest `maxBackups` files, removes older ones
 */
function pruneOldBackups(maxBackups = 15) {
  try {
    ensureBackupDir();
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup_festival_') && (f.endsWith('.sql') || f.endsWith('.json')))
      .map((f) => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    // Group by base name (without extension)
    const sqlFiles = files.filter((f) => f.name.endsWith('.sql'));
    if (sqlFiles.length > maxBackups) {
      const toDelete = sqlFiles.slice(maxBackups);
      toDelete.forEach((item) => {
        try {
          fs.unlinkSync(item.path);
          // Also delete companion json if exists
          const jsonCompanion = item.path.replace(/\.sql$/, '.json');
          if (fs.existsSync(jsonCompanion)) fs.unlinkSync(jsonCompanion);
        } catch (e) {
          console.warn('Could not prune backup:', item.name, e.message);
        }
      });
    }
  } catch (err) {
    console.warn('Failed to prune old backups:', err.message);
  }
}

/**
 * Perform a full database backup directly via MySQL connection
 */
async function performDatabaseBackup() {
  ensureBackupDir();

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const timestamp = `${dateStr}_${timeStr}`;
  const sqlFilename = `backup_festival_pohon_${timestamp}.sql`;
  const jsonFilename = `backup_festival_pohon_${timestamp}.json`;
  const sqlFilePath = path.join(BACKUP_DIR, sqlFilename);
  const jsonFilePath = path.join(BACKUP_DIR, jsonFilename);

  const connection = await pool.getConnection();

  try {
    // 1. Get database name
    const [dbRes] = await connection.query('SELECT DATABASE() AS db_name');
    const dbName = (dbRes[0] && dbRes[0].db_name) || 'festival_pohon_db';

    // 2. Discover tables
    const [tableRows] = await connection.query('SHOW TABLES');
    const tableKey = Object.keys(tableRows[0] || {})[0];
    const allTables = tableRows.map((r) => r[tableKey]);

    const preferredOrder = ['batas_wilayah', 'titik_tanam', 'proposals', 'admin_users'];
    const tables = [
      ...preferredOrder.filter((t) => allTables.includes(t)),
      ...allTables.filter((t) => !preferredOrder.includes(t)),
    ];

    let sqlContent = `-- ========================================================\n`;
    sqlContent += `-- Festival Tanam Hulu 2026 - Automated Database Backup\n`;
    sqlContent += `-- Database: ${dbName}\n`;
    sqlContent += `-- Date: ${now.toISOString()}\n`;
    sqlContent += `-- ========================================================\n\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sqlContent += `SET NAMES utf8mb4;\n\n`;

    const jsonExport = {
      backup_info: {
        database: dbName,
        timestamp: now.toISOString(),
        tables: tables,
      },
      data: {},
    };

    const rowCounts = {};

    for (const table of tables) {
      // Get CREATE TABLE definition
      const [createRes] = await connection.query(`SHOW CREATE TABLE \`${table}\``);
      const createTableSql = createRes[0]['Create Table'];

      sqlContent += `--\n-- Structure for table \`${table}\`\n--\n`;
      sqlContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      sqlContent += `${createTableSql};\n\n`;

      // Check column types for spatial geometry (geom)
      const [columns] = await connection.query(`DESCRIBE \`${table}\``);
      const geomCols = columns
        .filter((c) => c.Type && (c.Type.includes('point') || c.Type.includes('polygon') || c.Type.includes('geometry')))
        .map((c) => c.Field);

      // Query data with spatial conversion if needed
      let selectCols = '*';
      if (geomCols.length > 0) {
        selectCols = columns
          .map((c) => {
            if (geomCols.includes(c.Field)) {
              return `ST_AsText(\`${c.Field}\`) AS \`${c.Field}\``;
            }
            return `\`${c.Field}\``;
          })
          .join(', ');
      }

      const [rows] = await connection.query(`SELECT ${selectCols} FROM \`${table}\``);
      rowCounts[table] = rows.length;
      jsonExport.data[table] = rows;

      if (rows.length > 0) {
        sqlContent += `--\n-- Dumping data for table \`${table}\` (${rows.length} rows)\n--\n`;
        const colNames = Object.keys(rows[0]);
        const colsSql = colNames.map((c) => `\`${c}\``).join(', ');

        for (const row of rows) {
          const valSql = colNames
            .map((col) => {
              const val = row[col];
              if (geomCols.includes(col) && val) {
                return `ST_GeomFromText(${escapeSqlVal(val)})`;
              }
              return escapeSqlVal(val);
            })
            .join(', ');

          sqlContent += `INSERT INTO \`${table}\` (${colsSql}) VALUES (${valSql});\n`;
        }
        sqlContent += `\n`;
      }
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    sqlContent += `-- Backup complete: ${tables.length} tables, ${Object.values(rowCounts).reduce((a, b) => a + b, 0)} total rows.\n`;

    // Write SQL file
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');

    // Write JSON file (excluding password_hash/salt for extra security)
    if (jsonExport.data.admin_users) {
      jsonExport.data.admin_users = jsonExport.data.admin_users.map((u) => ({
        id: u.id,
        username: u.username,
        nama_lengkap: u.nama_lengkap,
        role: u.role,
        last_login: u.last_login,
        created_at: u.created_at,
      }));
    }
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonExport, null, 2), 'utf8');

    const stats = fs.statSync(sqlFilePath);

    // Prune backups beyond maxBackups
    pruneOldBackups(15);

    return {
      success: true,
      filename: sqlFilename,
      jsonFilename,
      sqlPath: sqlFilePath,
      jsonPath: jsonFilePath,
      sizeBytes: stats.size,
      tablesBackedUp: tables,
      rowCounts,
      timestamp: now.toISOString(),
    };
  } finally {
    connection.release();
  }
}

/**
 * List existing backups in the backup folder
 */
function listBackups() {
  ensureBackupDir();
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith('backup_festival_') && f.endsWith('.sql'))
      .map((f) => {
        const fullPath = path.join(BACKUP_DIR, f);
        const stat = fs.statSync(fullPath);
        return {
          filename: f,
          sizeBytes: stat.size,
          sizeFormatted: `${(stat.size / 1024).toFixed(1)} KB`,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return files;
  } catch (err) {
    console.error('Error listing backups:', err);
    return [];
  }
}

module.exports = {
  performDatabaseBackup,
  listBackups,
  BACKUP_DIR,
};
