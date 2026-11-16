function renderCourse() {
  const course = getCourse(params.get('course'));
  const section = byId('course');
  if (!course) {
    section.innerHTML = `<section class="page-intro"><div class="container">
      <p class="eyebrow">Каталог / Программа</p><h1>Выберите курс</h1>
      <p class="intro">Откройте каталог, чтобы посмотреть доступные программы.</p>
      <a class="btn btn-primary" href="catalog.html">В каталог <span aria-hidden="true">↗</span></a>
    </div></section>`;
    return;
  }
  byId('product-crumb').textContent = course.title;
  document.title = `${course.title} — CodePath`;
  section.innerHTML = `
    <section class="page-intro course-intro">
      <div class="container">
        <div class="row g-4 g-lg-5 align-items-center">
          <div class="col-12 col-lg-7">
            <p class="eyebrow">${course.category} / Программа</p>
            <h1>${course.title}</h1><p class="intro">${course.description}</p>
            <dl class="course-facts">
              <div><dt>Автор программы</dt><dd>${courseProviders[course.id]}</dd></div>
              <div><dt>Уровень</dt><dd>${course.level}</dd></div>
              <div><dt>Длительность</dt><dd>${course.weeks} нед.</dd></div>
              <div><dt>Стоимость</dt><dd>${money(course.price)}</dd></div>
            </dl>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-accent" type="button" data-add-cart="${course.id}">Добавить в корзину</button>
              <button class="btn btn-line" type="button" data-bs-toggle="modal" data-bs-target="#details">Как проходит обучение</button>
            </div>
          </div>
          <div class="col-12 col-lg-5">${photoGallery([course.id, extraPhotos[course.id]], course.title)}</div>
        </div>
      </div>
    </section>
    <section class="section inner-body course-program" aria-labelledby="program-title">
      <div class="container">
        <div class="section-heading"><div><p class="eyebrow">От темы к практике</p><h2 id="program-title">Программа курса</h2></div></div>
        <div class="row g-4 g-lg-5 align-items-start">
          <div class="col-12 col-lg-8">
            <div class="table-responsive" tabindex="0" role="region" aria-label="Таблица модулей">
              <table class="table table-striped mb-0"><thead><tr><th scope="col">Модуль</th><th scope="col">Тема</th></tr></thead>
                <tbody>${course.modules.map((module, index) => `<tr><th scope="row">${String(index + 1).padStart(2, '0')}</th><td>${module}</td></tr>`).join('')}</tbody>
              </table>
            </div>
          </div>
          <aside class="col-12 col-lg-4"><div class="requirements">
            <h3>Что нужно знать</h3><p>${course.requirements}</p>
            <a class="inline-link" href="learning.html">Формат занятий <span aria-hidden="true">↗</span></a>
          </div></aside>
        </div>
      </div>
    </section>`;
}

function renderCards(items) {
  byId('courses').innerHTML = items.map((course) => `
    <div class="col-12 col-md-6 col-xl-4">
      <article class="card course-card h-100">
        ${photoGallery([course.id, extraPhotos[course.id]], course.title)}
        <div class="card-body">
          <p class="card-provider">${courseProviders[course.id]} · ${course.category}</p>
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <p class="course-spec">${course.level} уровень · ${course.weeks} нед.</p>
          <div class="course-buy">
            <strong>${money(course.price)}</strong>
            <div class="d-flex flex-wrap gap-2 mt-2">
              <a class="btn btn-line" href="product.html?course=${course.id}">Подробнее<span class="visually-hidden"> о курсе «${course.title}»</span></a>
              <button class="btn btn-accent" type="button" data-add-cart="${course.id}" aria-label="Добавить курс «${course.title}»">Добавить</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

function setupCatalog() {
  const form = byId('filters');
  const { query, category, provider, limit, sort } = form.elements;
  const filterPanel = byId('filter-panel');
  const initialCategory = { code: 'Программирование', data: 'Анализ данных', ml: 'Машинное обучение' };
  for (const value of new Set(courses.map((course) => course.category))) category.add(new Option(value, value));
  for (const value of new Set(Object.values(courseProviders))) provider.add(new Option(value, value));
  category.value = initialCategory[params.get('direction')] || '';
  query.value = params.get('q') || '';
  if (category.value) filterPanel.open = true;

  function update() {
    const term = query.value.trim().toLowerCase();
    const results = courses.filter((course) => {
      const searchable = `${course.title} ${course.description} ${course.category} ${courseProviders[course.id]}`.toLowerCase();
      return searchable.includes(term) && (!category.value || category.value === course.category)
        && (!provider.value || provider.value === courseProviders[course.id])
        && (!limit.value || course.price <= Number(limit.value));
    });
    if (sort.value === 'price') results.sort((a, b) => a.price - b.price);
    if (sort.value === 'duration') results.sort((a, b) => a.weeks - b.weeks);
    renderCards(results);
    byId('result-count').textContent = `Курсов найдено: ${results.length}`;
    byId('empty').hidden = Boolean(results.length);
  }

  byId('reset-filters').addEventListener('click', () => {
    form.reset();
    query.focus();
    update();
  });
  byId('reset').addEventListener('click', () => byId('reset-filters').click());
  form.addEventListener('input', update);
  form.addEventListener('submit', (event) => { event.preventDefault(); update(); });
  update();
}

function setupReviews() {
  const rail = byId('review-rail');
  const pause = byId('pause-reviews');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches;
  let interacting = false;
  function renderPause() {
    pause.textContent = paused ? 'Продолжить' : 'Пауза';
    pause.setAttribute('aria-pressed', String(paused));
  }
  pause.addEventListener('click', () => { paused = !paused; renderPause(); });
  rail.addEventListener('pointerenter', () => { interacting = true; });
  rail.addEventListener('pointerleave', () => { interacting = false; });
  for (const direction of [-1, 1]) {
    byId(direction < 0 ? 'reviews-prev' : 'reviews-next').addEventListener('click', () => {
      rail.scrollBy({ left: direction * (rail.querySelector('article').offsetWidth + 16), behavior: preference.matches ? 'auto' : 'smooth' });
    });
  }
  setInterval(() => {
    if (paused || interacting || rail.contains(document.activeElement) || rail.querySelector('details[open]')) return;
    const end = rail.scrollWidth - rail.clientWidth;
    if (rail.scrollLeft >= end - 2) rail.scrollTo({ left: 0, behavior: 'auto' });
    else rail.scrollLeft += 1;
  }, 38);
  renderPause();
}

switch (document.body.dataset.page) {
  case 'index': renderCards(courses.slice(0, 3)); setupReviews(); break;
  case 'catalog': setupCatalog(); break;
  case 'product': renderCourse(); break;
  case 'contacts':
    byId('feedback').addEventListener('submit', (event) => {
      event.preventDefault();
      event.currentTarget.reset();
      byId('feedback-status').textContent = 'Поля проверены. Сообщение в демонстрационной форме не отправляется.';
      byId('feedback-status').hidden = false;
      byId('feedback-status').focus();
    });
    break;
}
