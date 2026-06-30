const UPLOAD_MARKER = '/upload/';

let portfolio = [];
let gallerie = [];
let galleriaCorrente = null;
let lbIndex = 0;
let isPortfolioLB = false;
let unlockedGalleries = {};

const $ = (id) => document.getElementById(id);

function esc(s) {
  if (!s) return '';
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function cloudinaryUrl(url, transform) {
  if (!url || !url.includes(UPLOAD_MARKER)) return url;
  return url.replace(/\/upload\/(?:[^/]+\/)*?/, `${UPLOAD_MARKER}${transform}/`);
}

function thumbUrl(url) {
  return cloudinaryUrl(url, 'w_600,q_80');
}

function displayUrl(url) {
  return cloudinaryUrl(url, 'w_1600,q_80');
}

function downloadUrl(url) {
  return cloudinaryUrl(url, 'fl_attachment');
}

function galleryPhotos(g) {
  if (g.protected) {
    return unlockedGalleries[g.id] || [];
  }
  return g.photos || [];
}

function photoCount(g) {
  if (g.protected) {
    const unlocked = unlockedGalleries[g.id];
    return unlocked ? unlocked.length : g.photoCount || null;
  }
  return (g.photos || []).length;
}

function loadUnlockedFromSession() {
  try {
    const raw = sessionStorage.getItem('unlockedGalleries');
    if (raw) unlockedGalleries = JSON.parse(raw);
  } catch (err) {
    console.warn('loadUnlockedFromSession: corrupted session data, resetting', err);
    unlockedGalleries = {};
  }
}

function saveUnlockedToSession() {
  try {
    sessionStorage.setItem('unlockedGalleries', JSON.stringify(unlockedGalleries));
  } catch (err) {
    console.warn('saveUnlockedToSession: unable to persist gallery data', err);
  }
}

function showPanel(id) {
  const el = $(id);
  el.classList.add('on');
  el.setAttribute('aria-hidden', 'false');
}

function hidePanel(id) {
  const el = $(id);
  el.classList.remove('on');
  el.setAttribute('aria-hidden', 'true');
}

function scrollToSection(id) {
  closeMobileNav();
  $(id).scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileNav() {
  const nav = $('nav-mobile');
  const open = nav.classList.toggle('on');
  $('menu-toggle').setAttribute('aria-expanded', String(open));
}

function closeMobileNav() {
  $('nav-mobile').classList.remove('on');
  $('menu-toggle').setAttribute('aria-expanded', 'false');
}

function renderThumb({ url, index, onClick, alt, loading }) {
  return `
    <button type="button" class="thumb" onclick="${onClick}(${index})" aria-label="${alt}">
      <img src="${thumbUrl(url)}" alt="${alt}" loading="${loading || 'lazy'}" decoding="async"
           onerror="this.parentElement.style.background='#1a1a1a'">
      <div class="thumb-hover" aria-hidden="true">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1">
          <circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
    </button>`;
}

function renderPortfolio() {
  const pGrid = $('portfolio-grid');
  if (!portfolio.length) {
    pGrid.innerHTML = '';
    return;
  }

  pGrid.innerHTML = portfolio.map((url, i) => renderThumb({
    url,
    index: i,
    onClick: 'apriLBP',
    alt: `Apri foto portfolio ${i + 1}`,
    loading: i < 3 ? 'eager' : 'lazy',
  })).join('');
}

function renderHome() {
  const grid = $('grid');
  if (!gallerie.length) {
    grid.innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <div class="empty-icon" aria-hidden="true">📷</div>
        <p class="empty-title">Nessuna galleria ancora</p>
        <p class="empty-sub">Aggiungi le gallerie nel file <code>galleries.json</code>.</p>
      </div>`;
    return;
  }

  grid.innerHTML = gallerie.map((g, i) => {
    const count = photoCount(g);
    return `
      <button type="button" class="card" onclick="apriGalleria(${i})" aria-label="Apri galleria ${esc(g.name)}">
        <img src="${thumbUrl(g.cover)}" alt="Cover — ${esc(g.name)}" loading="lazy" decoding="async"
             width="600" height="450" onerror="this.style.display='none'">
        <div class="card-info">
          <p class="card-cat">${esc(g.category)}</p>
          <h3 class="card-name">${esc(g.name)}</h3>
          <div class="card-meta">
            <span>${esc(g.date)}</span>
            ${count ? `<span aria-hidden="true">·</span><span>${count} foto</span>` : ''}
          </div>
        </div>
        ${g.protected ? `
          <div class="card-lock" aria-hidden="true">
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>` : ''}
      </button>`;
  }).join('');
}

window.scrollPortfolio = () => scrollToSection('portfolio-section');
window.scrollGallerie = () => scrollToSection('gallerie-section');
window.scrollAbout = () => scrollToSection('about-section');
window.scrollContatti = () => scrollToSection('contact-section');
window.toggleMobileNav = toggleMobileNav;
window.mostraHome = () => {
  chiudiGalleria();
  closeMobileNav();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.apriGalleria = (i) => {
  galleriaCorrente = gallerie[i];

  if (galleriaCorrente.protected && !unlockedGalleries[galleriaCorrente.id]) {
    $('modal-nome').textContent = galleriaCorrente.name;
    $('modal-pass').value = '';
    $('modal-err').textContent = '';
    showPanel('modal-bg');
    setTimeout(() => $('modal-pass').focus(), 120);
    return;
  }

  mostraGalleria(galleriaCorrente);
};

window.chiudiModal = () => {
  hidePanel('modal-bg');
};

window.verificaPassword = async () => {
  const input = $('modal-pass');
  const btn = $('modal-btn');
  const err = $('modal-err');
  const password = input.value.trim();

  if (!password) {
    err.textContent = 'Inserisci la password.';
    return;
  }

  btn.disabled = true;
  err.textContent = '';

  try {
    const res = await fetch('/.netlify/functions/verify-gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        galleryId: galleriaCorrente.id,
        password,
      }),
    });

    let data;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error('verificaPassword: invalid JSON response', parseErr);
      err.textContent = 'Risposta non valida dal server.';
      input.select();
      return;
    }

    if (!res.ok || !data.ok) {
      err.textContent = data.error || 'Password errata.';
      input.select();
      return;
    }

    unlockedGalleries[galleriaCorrente.id] = data.photos || [];
    saveUnlockedToSession();
    chiudiModal();
    mostraGalleria(galleriaCorrente);
  } catch (networkErr) {
    console.error('verificaPassword: network/fetch error', networkErr);
    err.textContent = 'Verifica non disponibile. Controlla la connessione o la funzione Netlify.';
  } finally {
    btn.disabled = false;
  }
};

function mostraGalleria(g) {
  const photos = galleryPhotos(g);
  $('gh-title').textContent = g.name;
  $('gh-count').textContent = photos.length ? `${photos.length} foto` : '';

  $('photo-grid').innerHTML = photos.length
    ? photos.map((url, i) => `
        <button type="button" class="thumb" onclick="apriLB(${i})" aria-label="Apri foto ${i + 1} di ${photos.length}">
          <img src="${thumbUrl(url)}" alt="${esc(g.name)} — foto ${i + 1}" loading="lazy" decoding="async"
               onerror="this.parentElement.style.background='#1a1a1a'">
          <div class="thumb-hover" aria-hidden="true">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1">
              <circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
        </button>`).join('')
    : `<div class="empty" style="column-span:all">
        <div class="empty-icon" aria-hidden="true">🖼️</div>
        <p class="empty-title">Nessuna foto disponibile</p>
       </div>`;

  $('gallery-screen').classList.add('on');
  $('gallery-screen').scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

window.chiudiGalleria = () => {
  $('gallery-screen').classList.remove('on');
  galleriaCorrente = null;
  document.body.style.overflow = '';
};

function openLightbox(i, fromPortfolio) {
  isPortfolioLB = fromPortfolio;
  lbIndex = i;
  aggiornaLB();
  showPanel('lightbox');
}

window.apriLBP = (i) => openLightbox(i, true);
window.apriLB = (i) => openLightbox(i, false);

window.chiudiLB = () => {
  hidePanel('lightbox');
};

function currentPhotos() {
  return isPortfolioLB ? portfolio : galleryPhotos(galleriaCorrente);
}

function aggiornaLB() {
  const photos = currentPhotos();
  const url = photos[lbIndex];
  const img = $('lb-img');
  img.alt = isPortfolioLB
    ? `Portfolio — foto ${lbIndex + 1} di ${photos.length}`
    : `${galleriaCorrente.name} — foto ${lbIndex + 1} di ${photos.length}`;
  img.src = displayUrl(url);
  $('lb-n').textContent = `${lbIndex + 1} / ${photos.length}`;
}

window.navLB = (dir) => {
  const photos = currentPhotos();
  lbIndex = (lbIndex + dir + photos.length) % photos.length;
  aggiornaLB();
};

window.scarica = async () => {
  const photos = currentPhotos();
  const url = downloadUrl(photos[lbIndex]);
  const btn = $('lb-dl');
  const name = isPortfolioLB
    ? `portfolio-${lbIndex + 1}.jpg`
    : `${galleriaCorrente.id}-${lbIndex + 1}.jpg`;

  btn.disabled = true;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = name;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch (dlErr) {
    console.warn('scarica: blob download failed, opening in new tab', dlErr);
    window.open(url, '_blank', 'noopener,noreferrer');
  } finally {
    btn.disabled = false;
  }
};

document.addEventListener('keydown', (e) => {
  if ($('lightbox').classList.contains('on')) {
    if (e.key === 'ArrowRight') window.navLB(1);
    if (e.key === 'ArrowLeft') window.navLB(-1);
    if (e.key === 'Escape') window.chiudiLB();
  } else if ($('modal-bg').classList.contains('on')) {
    if (e.key === 'Escape') window.chiudiModal();
    if (e.key === 'Enter' && e.target.id === 'modal-pass') window.verificaPassword();
  } else if ($('gallery-screen').classList.contains('on')) {
    if (e.key === 'Escape') window.chiudiGalleria();
  }
});

$('lightbox').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox') window.chiudiLB();
});

$('modal-bg').addEventListener('click', (e) => {
  if (e.target.id === 'modal-bg') window.chiudiModal();
});

document.addEventListener('click', (e) => {
  const nav = $('nav-mobile');
  const toggle = $('menu-toggle');
  if (nav.classList.contains('on') && !nav.contains(e.target) && !toggle.contains(e.target)) {
    closeMobileNav();
  }
});

async function init() {
  loadUnlockedFromSession();

  let data = window.__GALLERIES_DATA || null;
  if (!data) {
    try {
      const res = await fetch('galleries.json');
      if (!res.ok) throw new Error(`Failed to load galleries.json: ${res.status} ${res.statusText}`);
      data = await res.json();
    } catch (initErr) {
      console.error('init: unable to load galleries', initErr);
      portfolio = [];
      gallerie = [];
      renderPortfolio();
      renderHome();
      $('year').textContent = new Date().getFullYear();
      return;
    }
  }

  portfolio = data.portfolio || [];
  gallerie = data.galleries || [];

  if (data.siteUrl) {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = data.siteUrl;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', data.siteUrl);
  }

  const cover = gallerie[0]?.cover || portfolio[0];
  if (cover) {
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', displayUrl(cover));
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', displayUrl(cover));
  }

  renderPortfolio();
  renderHome();
  $('year').textContent = new Date().getFullYear();
}

init();
