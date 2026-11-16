const iconPaths = {
  cart: '<path d="M3 3h2l2.5 12h11L22 7H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  moon: '<path d="M20.5 15A8.5 8.5 0 0 1 9 3.5 8.5 8.5 0 1 0 20.5 15Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2m10-10 2-2"/>',
  left: '<path d="m15 5-7 7 7 7"/>',
  right: '<path d="m9 5 7 7-7 7"/>',
  up: '<path d="m5 15 7-7 7 7"/>',
  phone: '<path d="M6 3h4l2 5-3 2c1.4 2.4 2.8 3.8 5 5l2-3 5 2v4c0 2-1.4 3-3 3C10 20 4 14 3 6c0-2 1-3 3-3Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  pin: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2"/>',
  close: '<path d="m5 5 14 14M19 5 5 19"/>',
};
function svgIcon(name, css = '') {
  return `<svg class="ui-icon ${css}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
}
document.querySelectorAll('[data-icon]').forEach((marker) => {
  marker.innerHTML = svgIcon(marker.dataset.icon, marker.dataset.iconClass || '');
});

function liveMessage(text) {
  const live = byId('site-status');
  live.textContent = text;
  live.classList.add('is-visible');
  clearTimeout(liveMessage.timer);
  liveMessage.timer = setTimeout(() => live.classList.remove('is-visible'), 3400);
}
function updateCartBadge() {
  const count = cartIds().length;
  byId('cart-count').textContent = count;
  byId('cart-count').hidden = !count;
  byId('cart-link').setAttribute('aria-label', count ? `Корзина, позиций: ${count}` : 'Корзина пуста');
}
updateCartBadge();
document.addEventListener('shopchange', updateCartBadge);
window.addEventListener('storage', (event) => {
  if (event.key === shopKey) {
    shop = readShop();
    document.dispatchEvent(new Event('shopchange'));
  }
});

function photoGallery(photos, label) {
  const image = `<img src="images/photos/${photos[0]}.jpg" width="960" height="640" alt="" loading="lazy">`;
  if (photos.length === 1) return `<div class="photo-gallery">${image}</div>`;
  return `<div class="photo-gallery" data-photos="${photos.join(',')}" data-index="0" role="group" aria-label="Фотографии: ${escapeHtml(label)}">
    ${image}
    <div class="gallery-controls">
      <button class="btn photo-button" type="button" data-photo="-1" aria-label="Предыдущая фотография">${svgIcon('left')}</button>
      <span data-photo-count aria-live="polite">1 / ${photos.length}</span>
      <button class="btn photo-button" type="button" data-photo="1" aria-label="Следующая фотография">${svgIcon('right')}</button>
    </div>
  </div>`;
}
function trackCards() {
  return tracks.map((track) => `<div class="col-md-6 col-xl-4">
    <article class="card track-card h-100">
      ${photoGallery(track.ids, track.title)}
      <div class="card-body">
        ${track.badge ? `<p class="track-badge">${track.badge}</p>` : ''}
        <h3>${track.title}</h3><p>${track.copy}</p>
        <ul>${track.ids.map((id) => `<li>${getCourse(id).title}</li>`).join('')}</ul>
        <strong class="track-price">${money(totalOf(track.ids))}</strong>
        <div class="d-flex gap-2 flex-wrap mt-3">
          <a class="btn btn-line" href="builder.html?track=${track.id}">Открыть</a>
          <button class="btn btn-accent" type="button" data-buy-track="${track.id}">Заказать</button>
        </div>
      </div>
    </article>
  </div>`).join('');
}
document.querySelectorAll('[data-track-cards]').forEach((section) => { section.innerHTML = trackCards(); });

document.addEventListener('click', (event) => {
  const add = event.target.closest('[data-add-cart], [data-buy-track]');
  if (add) {
    const route = tracks.find((track) => track.id === add.dataset.buyTrack);
    const ids = route?.ids || [add.dataset.addCart];
    try {
      updateCart(ids);
      if (route) location.href = 'order.html';
      else liveMessage(cartIds().includes(ids[0]) ? `В корзине: ${getCourse(ids[0]).title}` : 'Курс недоступен');
    } catch {
      liveMessage('Не удалось сохранить корзину. Проверьте настройки хранилища браузера.');
    }
  }

  const change = event.target.closest('[data-photo]');
  if (change) {
    const gallery = change.closest('[data-photos]');
    const photos = gallery.dataset.photos.split(',');
    const index = (Number(gallery.dataset.index) + Number(change.dataset.photo) + photos.length) % photos.length;
    gallery.dataset.index = index;
    const img = gallery.querySelector('img');
    img.src = `images/photos/${photos[index]}.jpg`;
    gallery.querySelector('[data-photo-count]').textContent = `${index + 1} / ${photos.length}`;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) img.animate([{ opacity: .35 }, { opacity: 1 }], 270);
  }
});

const searchDialog = byId('site-search');
const searchTerm = byId('site-query');
const searchIndex = [
  ...courses.map((course) => ({
    href: `product.html?course=${course.id}`, title: course.title,
    text: `${course.category} · ${course.description}`,
    keywords: `${courseProviders[course.id]} ${course.modules.join(' ')}`,
  })),
  ...tracks.map((track) => ({ href: `builder.html?track=${track.id}`, title: track.title, text: track.copy })),
  ...directory,
];
function renderSearch() {
  const tokens = searchTerm.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = tokens.length ? searchIndex.filter((item) => {
    const haystack = `${item.title} ${item.text} ${item.keywords || ''}`.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  }) : directory.slice(1, 4);
  byId('site-results-count').textContent = tokens.length ? `Результатов: ${matches.length}` : 'Быстрые ссылки';
  byId('site-results').innerHTML = matches.length ? matches.map((item) => `
    <li><a href="${item.href}"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.text)}</small></a></li>
  `).join('') : '<li>Ничего не найдено. Попробуйте «Python» или «контакты».</li>';
}
byId('open-search').addEventListener('click', () => {
  renderSearch();
  searchDialog.showModal();
  searchTerm.focus();
});
searchTerm.addEventListener('input', renderSearch);
searchDialog.querySelector('form[role="search"]').addEventListener('submit', (event) => {
  event.preventDefault();
  byId('site-results').querySelector('a')?.focus();
});
searchDialog.addEventListener('click', (event) => {
  if (event.target === searchDialog) searchDialog.close();
});
