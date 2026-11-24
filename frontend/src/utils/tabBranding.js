/**
 * Instant Zero-Delay Tab Branding & Favicon Switcher
 * Dynamically switches browser favicon, tab title, and theme color
 * between Perkumpulan Galapagos and Festival Tanam Hulu with 0ms transition delay.
 */

const YAYASAN_FAVICON = '/logo-galapagos.png';
const FESTIVAL_FAVICON = '/logo-festival.png?v=4';

// Pre-cache both images into browser memory immediately at app startup
if (typeof window !== 'undefined') {
  const img1 = new Image();
  img1.src = YAYASAN_FAVICON;
  const img2 = new Image();
  img2.src = FESTIVAL_FAVICON;
}

export function setTabBranding(page = 'yayasan') {
  if (typeof document === 'undefined') return;

  const isYayasan = page === 'yayasan' || page === 'organisasi';

  // 1. Dynamic Tab Title
  if (isYayasan) {
    document.title = 'Perkumpulan Galapagos — Dari Ranah Minang untuk Bumi Sejak 1986';
  } else if (page === 'peta') {
    document.title = 'Peta WebGIS Titik Tanam — Festival Tanam Hulu 2026';
  } else if (page === 'berita') {
    document.title = 'Berita & Kabar Aksi — Festival Tanam Hulu 2026';
  } else if (page === 'tim') {
    document.title = 'Portal Tim Penanaman — Festival Tanam Hulu 2026';
  } else if (page === 'admin') {
    document.title = 'Panel Admin Panitia — Festival Tanam Hulu 2026';
  } else {
    document.title = 'Festival Tanam Hulu 2026 — Konservasi Hulu Sungai Kota Padang';
  }

  // 2. Instant Favicon Swap (Chrome / Edge / Firefox compliant)
  const targetFavicon = isYayasan ? YAYASAN_FAVICON : FESTIVAL_FAVICON;

  // Remove existing links so the browser instantly re-renders the new tab icon
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach((el) => el.parentNode && el.parentNode.removeChild(el));

  // Primary standard icon
  const link = document.createElement('link');
  link.type = 'image/png';
  link.rel = 'icon';
  link.href = targetFavicon;
  document.head.appendChild(link);

  // Shortcut icon
  const shortcutLink = document.createElement('link');
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.type = 'image/png';
  shortcutLink.href = targetFavicon;
  document.head.appendChild(shortcutLink);

  // Apple touch icon
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = targetFavicon;
  document.head.appendChild(appleLink);

  // 3. Theme color meta update
  let themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeMeta) {
    themeMeta = document.createElement('meta');
    themeMeta.name = 'theme-color';
    document.head.appendChild(themeMeta);
  }
  themeMeta.content = isYayasan ? '#1B3226' : '#063F35';
}
