const courses = [
  { id: 'python', title: 'Python с нуля', category: 'Программирование', level: 'Начальный', weeks: 6, price: 8900, description: 'Освойте синтаксис Python и напишите первую программу для автоматизации.', requirements: 'Достаточно уверенно пользоваться компьютером.', modules: ['Переменные, условия и циклы', 'Функции и коллекции', 'Работа с файлами', 'Проект: автоматизация отчёта'] },
  { id: 'frontend', title: 'Frontend-разработка', category: 'Программирование', level: 'Начальный', weeks: 8, price: 12900, description: 'Сверстайте адаптивный сайт и добавьте интерактивность на JavaScript.', requirements: 'Опыт программирования не требуется.', modules: ['Семантика HTML', 'CSS и адаптивная сетка', 'JavaScript и события', 'Проект: сайт веломастерской'] },
  { id: 'machine-learning', title: 'Машинное обучение', category: 'Машинное обучение', level: 'Средний', weeks: 10, price: 19900, description: 'Научитесь готовить данные, обучать модели и оценивать качество прогнозов.', requirements: 'Знание Python и основ статистики.', modules: ['Подготовка данных', 'Регрессия и классификация', 'Метрики и кросс-валидация', 'Проект: модель прогноза'] },
  { id: 'sql', title: 'SQL для анализа данных', category: 'Анализ данных', level: 'Начальный', weeks: 5, price: 7500, description: 'Пишите запросы, объединяйте таблицы и готовьте отчёты.', requirements: 'Навык работы с электронными таблицами будет полезен.', modules: ['Выборка и фильтрация', 'Агрегирование', 'Объединение таблиц', 'Проект: аналитический отчёт'] },
  { id: 'data-python', title: 'Анализ данных на Python', category: 'Анализ данных', level: 'Средний', weeks: 7, price: 14500, description: 'Очистите набор данных, проверьте гипотезу и представьте результаты на графиках.', requirements: 'Базовый Python: функции и коллекции.', modules: ['Таблицы в pandas', 'Очистка данных', 'Визуализация', 'Проект: анализ спроса на велопрокат'] },
  { id: 'deep-learning', title: 'Нейронные сети', category: 'Машинное обучение', level: 'Продвинутый', weeks: 12, price: 25900, description: 'Создайте и обучите нейронную сеть для классификации изображений.', requirements: 'Python, основы линейной алгебры и машинного обучения.', modules: ['Тензоры и обучение', 'Полносвязные сети', 'Свёрточные сети', 'Проект: классификация изображений'] },
];


const courseProviders = {
  python: 'CodePath', frontend: 'Web Lab', 'machine-learning': 'Data Lab',
  sql: 'Data Lab', 'data-python': 'Data Lab', 'deep-learning': 'Data Lab',
};
const extraPhotos = {
  python: 'workspace', frontend: 'python', 'machine-learning': 'deep-learning',
  sql: 'data-python', 'data-python': 'sql', 'deep-learning': 'machine-learning',
};
const courseNeeds = { 'data-python': 'python', 'machine-learning': 'python', 'deep-learning': 'machine-learning' };
const tracks = [
  { id: 'first', title: 'Первый шаг в код', ids: ['python', 'sql'], badge: 'Самый доступный',
    copy: 'Напишите первый скрипт и научитесь собирать отчёты из базы данных.' },
  { id: 'web', title: 'Свой первый сайт', ids: ['frontend', 'python'], badge: 'Для портфолио',
    copy: 'Соберите адаптивный сайт и автоматизируйте повседневную задачу на Python.' },
  { id: 'data', title: 'От таблиц к прогнозам', ids: ['python', 'data-python', 'machine-learning'], badge: '',
    copy: 'Подготовьте данные, визуализируйте результаты и обучите первую модель.' },
];
const directory = [
  { href: 'index.html', title: 'Главная', text: 'Популярные курсы, маршруты и частые вопросы' },
  { href: 'catalog.html', title: 'Каталог', text: 'Программирование, анализ данных, машинное обучение' },
  { href: 'builder.html', title: 'Подбор курсов', text: 'Учебный маршрут, бюджет, готовые варианты' },
  { href: 'learning.html', title: 'Как учимся', text: 'Занятия, практика и итоговый проект' },
  { href: 'projects.html', title: 'Проекты', text: 'Примеры учебных работ и портфолио' },
  { href: 'contacts.html', title: 'Контакты', text: 'Команда, график, обратная связь, адрес и карта' },
  { href: 'account.html', title: 'Личный кабинет', text: 'Вход, регистрация, история заказов и скидка' },
  { href: 'order.html', title: 'Корзина и заказ', text: 'Оформление, цены и скидка' },
];
const byId = (id) => document.getElementById(id);
const rub = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const money = (value) => rub.format(value);
const getCourse = (id) => courses.find((course) => course.id === id);
const validIds = (ids) => [...new Set(Array.isArray(ids) ? ids : [])].filter((id) => getCourse(id));
const totalOf = (ids) => ids.reduce((amount, id) => amount + getCourse(id).price, 0);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));
const params = new URLSearchParams(location.search);
