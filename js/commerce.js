const orderDate = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

function courseOptions(selected, available = courses) {
  return available.map((course) => `<option value="${course.id}"${course.id === selected ? ' selected' : ''}>${course.title} · ${money(course.price)}</option>`).join('');
}

function setStatus(id, text) {
  const region = byId(id);
  region.textContent = text;
  region.hidden = false;
}

function setupBuilder() {
  const preset = tracks.find((track) => track.id === params.get('track'));
  let ids = validIds(preset?.ids || (params.has('courses') ? params.get('courses').split(',') : shop.draft?.ids));
  const budgetInput = byId('route-budget');
  const initialBudget = params.has('courses') ? params.get('budget') : shop.draft?.budget;
  budgetInput.value = Number(initialBudget) > 0 ? Number(initialBudget) : '';
  const prior = byId('prior-skills');
  const list = byId('route-list');
  const picker = byId('route-picker');
  const budget = () => Math.max(0, Math.floor(Number(budgetInput.value) || 0));

  function update(persist = true) {
    if (persist) {
      try { changeShop((data) => { data.draft = { ids, budget: budget() }; }); }
      catch { setStatus('route-status', 'Не удалось записать черновик в браузере. Можно скачать список.'); }
    }
    const remaining = courses.filter((course) => !ids.includes(course.id));
    list.innerHTML = ids.length ? ids.map((id) => `<div class="route-row">
      <div><label class="visually-hidden" for="route-${id}">Заменить курс ${getCourse(id).title}</label>
      <select id="route-${id}" class="form-select" data-replace-course="${id}">${courseOptions(id, [getCourse(id), ...remaining])}</select></div>
      <button class="btn btn-line btn-sm" type="button" data-remove-route="${id}" aria-label="Убрать курс ${getCourse(id).title}">Убрать</button>
    </div>`).join('') : '<p class="text-body-secondary">Добавьте первый курс или откройте один из готовых маршрутов ниже.</p>';
    picker.innerHTML = '<option value="">Выберите курс</option>' + courseOptions('', remaining);
    picker.disabled = !remaining.length;
    byId('route-add').disabled = !remaining.length;
    const subtotal = totalOf(ids);
    byId('route-total').textContent = money(subtotal);
    const warnings = [];
    if (budget() && subtotal > budget()) warnings.push(`Сумма превышает бюджет на ${money(subtotal - budget())}.`);
    if (!prior.checked) {
      for (const id of ids) {
        const recommended = courseNeeds[id];
        if (recommended && !ids.includes(recommended)) {
          warnings.push(`Для «${getCourse(id).title}» рекомендуем сначала пройти «${getCourse(recommended).title}».`);
        } else if (recommended && ids.indexOf(recommended) > ids.indexOf(id)) {
          warnings.push(`Начните с курса «${getCourse(recommended).title}» перед «${getCourse(id).title}».`);
        }
      }
    }
    if (ids.length && !warnings.length) warnings.push('По бюджету и требованиям маршрут подходит.');
    byId('route-advice').replaceChildren(...warnings.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }));
    for (const key of ['route-save', 'route-copy', 'route-download', 'route-buy']) byId(key).disabled = !ids.length;
    byId('route-link').hidden = true;
  }
  byId('add-course-form').addEventListener('submit', (event) => {
    event.preventDefault();
    ids = validIds([...ids, picker.value]);
    update();
    picker.focus();
  });
  list.addEventListener('change', (event) => {
    const oldId = event.target.dataset.replaceCourse;
    if (!oldId) return;
    const newId = event.target.value;
    ids = validIds(ids.map((id) => id === oldId ? newId : id));
    update();
    byId(`route-${newId}`)?.focus();
  });
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-route]');
    if (!button) return;
    ids = ids.filter((id) => id !== button.dataset.removeRoute);
    update();
    picker.focus();
  });
  budgetInput.addEventListener('input', () => update());
  prior.addEventListener('change', () => update(false));
  byId('route-save').addEventListener('click', () => {
    try {
      if (!activeAccount()) {
        changeShop((data) => { data.pending = { ids, budget: budget() }; });
        location.href = 'account.html?next=builder';
        return;
      }
      changeShop((data) => saveRoute(data, ids, budget()));
      setStatus('route-status', 'Маршрут сохранён в личном кабинете.');
    } catch { setStatus('route-status', 'Не удалось сохранить маршрут в браузере.'); }
  });
  byId('route-copy').addEventListener('click', async () => {
    const url = new URL('builder.html', location.href);
    url.searchParams.set('courses', ids.join(','));
    if (budget()) url.searchParams.set('budget', budget());
    try {
      await navigator.clipboard.writeText(url.href);
      setStatus('route-status', 'Ссылка скопирована.');
    } catch {
      const field = byId('route-link');
      field.value = url.href;
      field.hidden = false;
      field.select();
      setStatus('route-status', 'Скопируйте выделенную ссылку.');
    }
  });
  byId('route-download').addEventListener('click', () => {
    const content = ['Учебный маршрут CodePath', ...ids.map((id) => `${getCourse(id).title} — ${money(getCourse(id).price)}`),
      `Итого: ${money(totalOf(ids))}`, budget() ? `Бюджет: ${money(budget())}` : ''].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'codepath-route.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  byId('route-buy').addEventListener('click', () => {
    try { updateCart(ids); location.href = 'order.html'; }
    catch { setStatus('route-status', 'Не удалось сохранить курсы в корзине.'); }
  });
  update(Boolean(preset || params.has('courses')));
}

function setupOrder() {
  const form = byId('checkout');
  const accountLink = byId('checkout-account');
  const phone = byId('checkout-phone');
  const email = byId('checkout-email');
  const legacyCourse = getCourse(params.get('course'));
  if (legacyCourse) {
    try {
      updateCart([legacyCourse.id]);
      history.replaceState(null, '', 'order.html');
    } catch { setStatus('checkout-error', 'Не удалось открыть корзину.'); }
  }
  if (activeAccount()) email.value = shop.session;
  try { phone.value = sessionStorage.getItem('codepath-checkout-phone') || ''; } catch {}
  phone.addEventListener('input', () => {
    phone.setCustomValidity('');
    try { sessionStorage.setItem('codepath-checkout-phone', phone.value); } catch {}
  });

  function render() {
    const ids = cartIds();
    const subtotal = totalOf(ids);
    const discount = Math.round(subtotal * loyalty().rate);
    const complete = shop.lastOrder?.account === shop.session ? shop.lastOrder : null;
    byId('checkout-items').innerHTML = ids.map((id) => `<li><a href="product.html?course=${id}">${getCourse(id).title}</a>
      <div><strong>${money(getCourse(id).price)}</strong>
      <button class="btn btn-line btn-sm" type="button" data-remove-cart="${id}" aria-label="Убрать курс ${getCourse(id).title}">Убрать</button></div></li>`).join('');
    byId('checkout-subtotal').textContent = money(subtotal);
    byId('checkout-discount').textContent = discount ? `−${money(discount)}` : money(0);
    byId('checkout-total').textContent = money(subtotal - discount);
    byId('checkout-empty').hidden = Boolean(ids.length || complete);
    byId('checkout-grid').hidden = !ids.length;
    accountLink.hidden = Boolean(activeAccount());
    byId('checkout-done').hidden = !complete || Boolean(ids.length);
    if (complete) byId('checkout-id').textContent = complete.id;
  }
  byId('checkout-items').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-cart]');
    if (!button) return;
    try {
      updateCart([button.dataset.removeCart], true);
      (byId('checkout-items').querySelector('button') || byId('checkout-empty-link')).focus();
    } catch { setStatus('checkout-error', 'Не удалось изменить корзину.'); }
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(digits.length >= 10 && digits.length <= 15 ? '' : 'Введите телефон с 10–15 цифрами.');
    if (!form.reportValidity()) return;
    const ids = cartIds();
    if (!ids.length) return;
    const subtotal = totalOf(ids);
    const discount = Math.round(subtotal * loyalty().rate);
    const order = { id: crypto.randomUUID().slice(0, 8).toUpperCase(), date: new Date().toISOString(),
      ids, subtotal, discount, total: subtotal - discount, account: shop.session };
    try {
      changeShop((data) => {
        const account = data.accounts[data.session];
        if (account) {
          account.orders.unshift(order);
          account.cart = [];
        } else data.guestCart = [];
        data.lastOrder = order;
      });
      form.reset();
      try { sessionStorage.removeItem('codepath-checkout-phone'); } catch {}
      byId('checkout-done').focus();
    } catch { setStatus('checkout-error', 'Не удалось сохранить заказ. Проверьте настройки хранилища браузера.'); }
  });
  document.addEventListener('shopchange', render);
  render();
}

function setupAccount() {
  const login = byId('login-form');
  const register = byId('register-form');
  const next = params.get('next');
  const modeLinks = byId('auth-modes');
  function setMode(registration) {
    login.hidden = registration;
    register.hidden = !registration;
    for (const button of modeLinks.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String((button.dataset.mode === 'register') === registration));
    }
    byId('auth-error').hidden = true;
  }
  modeLinks.addEventListener('click', (event) => {
    if (!event.target.dataset.mode) return;
    const registration = event.target.dataset.mode === 'register';
    setMode(registration);
    (registration ? register : login).querySelector('input').focus();
  });
  register.elements.repeat.addEventListener('input', () => register.elements.repeat.setCustomValidity(''));
  register.elements.password.addEventListener('input', () => register.elements.repeat.setCustomValidity(''));

  function render() {
    const account = activeAccount();
    byId('auth-panel').hidden = Boolean(account);
    byId('profile-panel').hidden = !account;
    if (!account) return;
    byId('profile-name').textContent = account.name;
    byId('profile-email').textContent = shop.session;
    const level = loyalty(account);
    byId('loyalty-text').textContent = level.rate
      ? `За этот месяц оформлено на ${money(level.spent)}. Скидка 5% применяется в следующем заказе.`
      : `За этот месяц оформлено на ${money(level.spent)}. До скидки 5% осталось ${money(discountThreshold - level.spent)}.`;
    byId('profile-routes').innerHTML = account.routes.length ? account.routes.map((route) => `<li>
      <div><strong>${route.ids.map((id) => getCourse(id).title).join(' + ')}</strong><br><small>${money(totalOf(route.ids))}${route.budget ? ` · бюджет ${money(route.budget)}` : ''}</small></div>
      <div class="profile-actions"><a class="btn btn-line btn-sm" href="builder.html?courses=${route.ids.join(',')}&amp;budget=${route.budget}">Открыть</a>
      <button class="btn btn-line btn-sm" type="button" data-delete-route="${route.id}">Удалить</button></div>
    </li>`).join('') : '<li>Пока нет сохранённых маршрутов.</li>';
    byId('profile-orders').innerHTML = account.orders.length ? account.orders.map((order) => `<li>
      <div><strong>№ ${escapeHtml(order.id)} · ${orderDate.format(new Date(order.date))}</strong><br><small>${order.ids.map((id) => getCourse(id).title).join(', ')}</small></div>
      <strong>${money(order.total)}</strong>
    </li>`).join('') : '<li>Заказов пока нет.</li>';
  }

  async function authenticate(event, registration) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.password.value;
    if (registration && password !== form.elements.repeat.value) {
      form.elements.repeat.setCustomValidity('Пароли должны совпадать.');
      form.elements.repeat.reportValidity();
      return;
    }
    const email = form.elements.email.value.trim().toLowerCase();
    const existing = shop.accounts[email];
    if (registration && existing) { setStatus('auth-error', 'Этот профиль уже зарегистрирован. Выберите вход.'); return; }
    if (!registration && !existing) { setStatus('auth-error', 'Профиль с этой почтой не найден.'); return; }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    try {
      const salt = existing?.salt || crypto.randomUUID();
      const hash = await passwordHash(password, salt);
      if (!registration && hash !== existing.hash) {
        setStatus('auth-error', 'Пароль не подходит.');
        return;
      }
      const profile = registration ? { name: form.elements.name.value.trim(), salt, hash, routes: [], cart: [], orders: [] } : null;
      const saved = openAccount(email, profile);
      login.reset();
      register.reset();
      if (next === 'order') { location.href = 'order.html'; return; }
      if (saved) setStatus('profile-status', 'Маршрут сохранён после входа.');
      byId('profile-name').focus();
    } catch { setStatus('auth-error', 'Не удалось открыть профиль. Откройте сайт по HTTPS или через локальный сервер.'); }
    finally { submit.disabled = false; }
  }
  login.addEventListener('submit', (event) => authenticate(event, false));
  register.addEventListener('submit', (event) => authenticate(event, true));
  byId('logout').addEventListener('click', () => {
    try {
      changeShop((data) => { data.session = ''; data.lastOrder = null; });
      setMode(false);
      login.elements.email.focus();
    } catch { setStatus('profile-status', 'Не удалось выйти из профиля.'); }
  });
  byId('profile-routes').addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-route]');
    if (!button) return;
    try {
      changeShop((data) => {
        const account = data.accounts[data.session];
        account.routes = account.routes.filter((route) => route.id !== button.dataset.deleteRoute);
      });
      byId('profile-route-link').focus();
    } catch { setStatus('profile-status', 'Не удалось удалить маршрут.'); }
  });
  document.addEventListener('shopchange', render);
  setMode(params.get('mode') === 'register');
  render();
}

switch (document.body.dataset.page) {
  case 'builder': setupBuilder(); break;
  case 'order': setupOrder(); break;
  case 'account': setupAccount(); break;
}
