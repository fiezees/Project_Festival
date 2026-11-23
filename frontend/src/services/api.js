const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';

/**
 * Helper to resolve static asset paths (e.g. /uploads/tanam/...) to full reachable URLs
 */
export function getAssetUrl(pathOrUrl) {
  if (!pathOrUrl) return '';
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:')
  ) {
    return pathOrUrl;
  }
  const backendBase = (import.meta.env.VITE_API_BASE || 'http://localhost:3001/api').replace(/\/api\/?$/, '');
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${backendBase}${cleanPath}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data && data.error ? data.error : `Request gagal (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getWilayah() {
  return request('/wilayah');
}

export function getTanam() {
  return request('/tanam');
}

export function getStats() {
  return request('/stats');
}

// ── Proposal Submissions ───────────────────────────────────
export async function submitProposal(formData) {
  // When body is FormData, do not set Content-Type header
  const response = await fetch(`${API_BASE}/proposals`, {
    method: 'POST',
    body: formData,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data && data.error ? data.error : `Gagal mengirim proposal (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

// ── Admin Authentication ───────────────────────────────────
export function adminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
}

export function getAdminProfile(token) {
  return request('/admin/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ── Admin Proposal Management ──────────────────────────────
export function getAdminProposals(token, params = {}) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.append('q', params.q);
  if (params.status && params.status !== 'Semua') searchParams.append('status', params.status);

  const queryString = searchParams.toString();
  const path = `/proposals${queryString ? `?${queryString}` : ''}`;

  return request(path, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateProposalStatus(token, id, status, catatanAdmin = undefined) {
  const payload = { status };
  if (catatanAdmin !== undefined) payload.catatan_admin = catatanAdmin;

  return request(`/proposals/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateProposalNotes(token, id, catatanAdmin) {
  return request(`/proposals/${id}/notes`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ catatan_admin: catatanAdmin }),
  });
}

export function bulkUpdateProposalStatus(token, ids, status) {
  return request('/proposals/bulk-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids, status }),
  });
}

export function trackProposal(regId) {
  return request(`/proposals/track/${encodeURIComponent(regId.trim())}`);
}

export function deleteProposal(token, id) {
  return request(`/proposals/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getProposalDownloadUrl(id) {
  return `${API_BASE}/proposals/${id}/download`;
}

export function getProposalPreviewUrl(id) {
  return `${API_BASE}/proposals/${id}/preview`;
}

export async function downloadDatabaseBackup(token) {
  const res = await fetch(`${API_BASE}/admin/backup/download`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Gagal mengunduh backup database');
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') || '';
  let filename = 'backup_festival_pohon.sql';
  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match && match[1]) filename = match[1];

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return filename;
}

export function triggerDatabaseBackup(token) {
  return request('/admin/backup', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ==========================================
// Admin Team Accounts & Curation
// ==========================================
export function generateTeamAccount(token, proposal_id, target_pohon = 10, custom_password = '') {
  return request('/admin/teams/generate-account', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ proposal_id, target_pohon, custom_password }),
  });
}

export function getAdminTeams(token) {
  return request('/admin/teams', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getAdminPlantingPoints(token, status = '') {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`/admin/titik-tanam${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function verifyPlantingPoint(token, id, status_verifikasi, catatan_verifikasi = '') {
  return request(`/admin/titik-tanam/${id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status_verifikasi, catatan_verifikasi }),
  });
}

// ==========================================
// Team Portal (Khusus 10 Tim Penanam)
// ==========================================
export function timLogin(username, password) {
  return request('/tim/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
}

export function getTimProfile(timToken) {
  return request('/tim/me', {
    headers: {
      Authorization: `Bearer ${timToken}`,
    },
  });
}

export function getTimPlantingPoints(timToken) {
  return request('/tim/titik-tanam', {
    headers: {
      Authorization: `Bearer ${timToken}`,
    },
  });
}

export async function submitTimPlantingPoint(timToken, formData) {
  const response = await fetch(`${API_BASE}/tim/titik-tanam`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${timToken}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengirim titik penanaman');
  }
  return data;
}

export function deleteTimPlantingPoint(timToken, id) {
  return request(`/tim/titik-tanam/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${timToken}`,
    },
  });
}
