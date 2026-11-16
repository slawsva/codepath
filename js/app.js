const courses = [
  { id: 'python', title: 'Python с нуля', category: 'Программирование', level: 'Начальный', weeks: 6, price: 8900, description: 'Освойте синтаксис Python и напишите первую программу для автоматизации.', requirements: 'Достаточно уверенно пользоваться компьютером.', modules: ['Переменные, условия и циклы', 'Функции и коллекции', 'Работа с файлами', 'Проект: автоматизация отчёта'] },
  { id: 'frontend', title: 'Frontend-разработка', category: 'Программирование', level: 'Начальный', weeks: 8, price: 12900, description: 'Сверстайте адаптивный сайт и добавьте интерактивность на JavaScript.', requirements: 'Опыт программирования не требуется.', modules: ['Семантика HTML', 'CSS и адаптивная сетка', 'JavaScript и события', 'Проект: сайт веломастерской'] },
  { id: 'machine-learning', title: 'Машинное обучение', category: 'Машинное обучение', level: 'Средний', weeks: 10, price: 19900, description: 'Научитесь готовить данные, обучать модели и оценивать качество прогнозов.', requirements: 'Знание Python и основ статистики.', modules: ['Подготовка данных', 'Регрессия и классификация', 'Метрики и кросс-валидация', 'Проект: модель прогноза'] },
  { id: 'sql', title: 'SQL для анализа данных', category: 'Анализ данных', level: 'Начальный', weeks: 5, price: 7500, description: 'Пишите запросы, объединяйте таблицы и готовьте отчёты.', requirements: 'Навык работы с электронными таблицами будет полезен.', modules: ['Выборка и фильтрация', 'Агрегирование', 'Объединение таблиц', 'Проект: аналитический отчёт'] },
  { id: 'data-python', title: 'Анализ данных на Python', category: 'Анализ данных', level: 'Средний', weeks: 7, price: 14500, description: 'Очистите набор данных, проверьте гипотезу и представьте результаты на графиках.', requirements: 'Базовый Python: функции и коллекции.', modules: ['Таблицы в pandas', 'Очистка данных', 'Визуализация', 'Проект: анализ спроса на велопрокат'] },
  { id: 'deep-learning', title: 'Нейронные сети', category: 'Машинное обучение', level: 'Продвинутый', weeks: 12, price: 25900, description: 'Создайте и обучите нейронную сеть для классификации изображений.', requirements: 'Python, основы линейной алгебры и машинного обучения.', modules: ['Тензоры и обучение', 'Полносвязные сети', 'Свёрточные сети', 'Проект: классификация изображений'] },
];

const byId = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const courseParam = new URLSearchParams(location.search).get('course');

const directions = new Map([
  ['code', 'Программирование'],
  ['data', 'Анализ данных'],
  ['ml', 'Машинное обучение'],
]);
const savedKey = 'codepath-saved-courses';

function readSavedCourses() {
  try {
    const ids = JSON.parse(localStorage.getItem(savedKey));
    if (Array.isArray(ids)) return new Set(ids.filter((id) => courses.some((course) => course.id === id)));
  } catch {
    // Saving still works on the current page if storage is unavailable.
  }
  return new Set();
}

const savedCourses = readSavedCourses();
const bookmarkIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h12v16l-6-4-6 4Z"/></svg>';

function bookmarkButton(course) {
  return `<button class="btn bookmark-button" type="button" data-bookmark="${course.id}" aria-label="Избранное: ${course.title}" aria-pressed="${savedCourses.has(course.id)}" title="Избранное">${bookmarkIcon}</button>`;
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-bookmark]');
  if (!button) return;
  const courseId = button.dataset.bookmark;
  if (savedCourses.has(courseId)) savedCourses.delete(courseId);
  else savedCourses.add(courseId);
  try {
    localStorage.setItem(savedKey, JSON.stringify([...savedCourses]));
  } catch {
    // Keep the new selection in memory for this page.
  }
  button.setAttribute('aria-pressed', String(savedCourses.has(courseId)));
  if (byId('saved-only')?.checked) {
    byId('filters').dispatchEvent(new Event('input'));
    (byId('courses').querySelector('[data-bookmark]') || byId('result-count')).focus({ preventScroll: true });
  }
});

function renderCards(items) {
  // The cards use the course data defined above, not text typed into the filters.
  byId('courses').innerHTML = items.map((course) => `
    <div class="col-12 col-md-6 col-lg-4">
      <article class="card course-card h-100">
        <div class="course-cover">
          <a href="product.html?course=${course.id}" aria-label="Программа курса «${course.title}»">
            <img src="images/photos/${course.id}.jpg" alt="" width="960" height="640" loading="lazy">
          </a>
          ${bookmarkButton(course)}
        </div>
        <div class="card-body">
          <p class="eyebrow">${course.category}</p>
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span class="badge">${course.level}</span><span class="badge">Недель: ${course.weeks}</span>
          </div>
          <div class="card-bottom">
            <span class="course-price">${currency.format(course.price)}</span>
            <a class="inline-link" href="product.html?course=${course.id}" aria-label="Подробнее о курсе «${course.title}»">Подробнее <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </article>
    </div>`).join('');
}

function setupCatalog() {
  const filters = byId('filters');
  const query = byId('query');
  const category = byId('category');
  const level = byId('level');
  const sort = byId('sort');
  const savedOnly = byId('saved-only');
  const params = new URLSearchParams(location.search);
  for (const value of new Set(courses.map((course) => course.category))) category.add(new Option(value, value));
  for (const value of new Set(courses.map((course) => course.level))) level.add(new Option(value, value));
  category.value = directions.get(params.get('direction')) || '';
  savedOnly.checked = params.get('saved') === '1';

  function update() {
    const term = query.value.trim().toLocaleLowerCase('ru');
    const results = courses.filter((course) => {
      const searchable = `${course.title} ${course.description} ${course.category}`.toLocaleLowerCase('ru');
      return searchable.includes(term) && (!category.value || course.category === category.value)
        && (!level.value || course.level === level.value)
        && (!savedOnly.checked || savedCourses.has(course.id));
    });
    if (sort.value === 'price') results.sort((first, second) => first.price - second.price);
    if (sort.value === 'duration') results.sort((first, second) => first.weeks - second.weeks);
    renderCards(results);
    byId('result-count').textContent = `Курсов найдено: ${results.length}`;
    byId('empty').hidden = results.length !== 0;
    byId('empty-detail').textContent = savedOnly.checked && !savedCourses.size
      ? 'Список пока пуст. Отключите фильтр и нажмите значок закладки на карточке курса.'
      : 'Попробуйте другой запрос или сбросьте фильтры.';
  }
  filters.addEventListener('input', update);
  filters.addEventListener('submit', (event) => {
    event.preventDefault();
    update();
  });
  byId('reset').addEventListener('click', () => {
    filters.reset();
    query.focus();
    update();
  });
  update();
}

function renderCourse() {
  const course = courses.find((item) => item.id === courseParam);
  const section = byId('course');
  if (!course) {
    section.innerHTML = `<section class="page-intro"><div class="container">
      <p class="eyebrow">Каталог / Программа</p><h1>Выберите курс</h1>
      <p class="intro">Откройте каталог, чтобы посмотреть доступные программы.</p>
      <a class="btn btn-primary" href="catalog.html">В каталог <span aria-hidden="true">↗</span></a>
    </div></section>`;
    return;
  }
  document.title = `${course.title} — CodePath`;
  section.innerHTML = `
    <section class="page-intro course-intro">
      <div class="container">
        <a class="inline-link breadcrumb-link" href="catalog.html">← Каталог</a>
        <div class="row g-4 g-lg-5 align-items-center">
          <div class="col-12 col-lg-7">
            <p class="eyebrow">${course.category} / Программа</p>
            <h1>${course.title}</h1><p class="intro">${course.description}</p>
            <dl class="course-facts">
              <div><dt>Уровень</dt><dd>${course.level}</dd></div>
              <div><dt>Длительность</dt><dd>${course.weeks} нед.</dd></div>
              <div><dt>Стоимость</dt><dd>${currency.format(course.price)}</dd></div>
            </dl>
            <div class="d-flex flex-wrap gap-2">
              <a class="btn btn-accent" href="order.html?course=${course.id}">Записаться <span aria-hidden="true">↗</span></a>
              <button class="btn btn-line" type="button" data-bs-toggle="modal" data-bs-target="#details">Как проходит обучение</button>
              ${bookmarkButton(course)}
            </div>
          </div>
          <div class="col-12 col-lg-5"><img class="feature-art course-photo" src="images/photos/${course.id}.jpg" alt="" width="960" height="640"></div>
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

function setupEnrollment() {
  const form = byId('enrollment');
  const select = byId('selected-course');
  const confirmation = byId('confirmation');
  for (const course of courses) select.add(new Option(course.title, course.id));
  if (courses.some((course) => course.id === courseParam)) select.value = courseParam;
  form.addEventListener('input', () => { confirmation.hidden = true; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const course = courses.find((item) => item.id === select.value);
    if (!course) return;
    confirmation.textContent = `Демонстрационная заявка на курс «${course.title}» подтверждена.`;
    confirmation.hidden = false;
    confirmation.focus();
    form.reset();
    select.value = course.id;
  });
}

switch (document.body.dataset.page) {
  case 'index': renderCards(courses.slice(0, 3)); break;
  case 'catalog': setupCatalog(); break;
  case 'product': renderCourse(); break;
  case 'order': setupEnrollment(); break;
}
