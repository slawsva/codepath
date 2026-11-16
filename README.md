# CodePath · КР 3

Каталог онлайн-курсов по программированию, анализу данных и машинному обучению. Автор — Святослав Сакулин, группа 12-40.

## Запуск

GitHub Pages: https://slawsva.github.io/codepath/

Для локального просмотра запустите `python3 -m http.server 8000` из корня и откройте http://localhost:8000. Bootstrap хранится в `vendor/`. Карта работает локально.

## Сценарии

- Главная содержит направления, готовые маршруты, популярные курсы, отзывы и FAQ.
- Каталог поддерживает поиск, сортировку, фильтры и галереи. С карточки можно добавить курс в корзину.
- В подборе можно менять состав и бюджет, проверять предварительные требования, сохранять, скачивать и делиться ссылкой.
- В браузерном кабинете доступны регистрация, вход, сохранённые маршруты, заказы и скидка. От 20 000 ₽ за календарный месяц начисляется скидка 5% для следующих заказов этого месяца.
- Корзина и прогресс хранятся в localStorage. Демо-формы не отправляют сообщения и не принимают платежи. Для кабинета нужен HTTPS или localhost. Используйте отдельный тестовый пароль.
- Контакты, отзывы, учебные команды и точка на карте демонстрационные.

## Фотографии

Фотографии курсов размещены по [лицензии Pexels](https://www.pexels.com/license/).

| Где используется | Автор и оригинал |
| --- | --- |
| Дополнительное фото рабочего места | [Daniil Komov](https://www.pexels.com/photo/modern-workspace-with-laptop-and-code-display-34804003/) |
| Python | [Nemuel Sereti](https://www.pexels.com/photo/programming-code-on-laptop-screen-6424590/) |
| Frontend | [Rodrigo Santos](https://www.pexels.com/photo/opened-program-for-working-online-on-laptop-3888149/) |
| Машинное обучение | [Diego Martinez](https://www.pexels.com/photo/advanced-robotic-arm-in-mexico-city-laboratory-29320998/) |
| SQL | [ThisIsEngineering](https://www.pexels.com/photo/graph-on-laptop-screen-3861957/) |
| Анализ данных | [Lukas Blazek](https://www.pexels.com/photo/notebook-and-charts-669613/) |
| Нейронные сети | [panumas nikhomkhai](https://www.pexels.com/photo/computer-server-in-data-center-room-17489156/) |

## Карта и баннер

- [Картографические данные OpenStreetMap](https://www.openstreetmap.org/copyright), ODbL 1.0. Схема района построена из [выгрузки OpenStreetMap](https://api.openstreetmap.org/api/0.6/map?bbox=37.6515,55.7468,37.681,55.7576).
- Баннер создан встроенным ImageGen. Изолированный ноутбук с редактором кода, синий блокнот и ручка на прозрачном фоне. Файл `images/photos/banner.png`.
