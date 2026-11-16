const shopKey = 'codepath-shop-v1';
const discountThreshold = 20000;
const discountRate = 0.05;

function readShop() {
  try {
    const saved = JSON.parse(localStorage.getItem(shopKey));
    if (saved?.accounts && Array.isArray(saved.guestCart)) return saved;
  } catch {
    // A new store is used when browser storage is empty or damaged.
  }
  return { accounts: {}, session: '', guestCart: [], pending: null, draft: null, lastOrder: null };
}

let shop = readShop();
function changeShop(update) {
  const next = structuredClone(shop);
  update(next);
  localStorage.setItem(shopKey, JSON.stringify(next));
  shop = next;
  document.dispatchEvent(new Event('shopchange'));
}

const activeAccount = () => shop.accounts[shop.session] || null;
const cartIds = () => validIds(activeAccount()?.cart ?? shop.guestCart);

function updateCart(ids, remove = false) {
  const current = cartIds();
  const next = remove ? current.filter((id) => !ids.includes(id)) : validIds([...current, ...ids]);
  changeShop((data) => {
    const account = data.accounts[data.session];
    if (account) account.cart = next;
    else data.guestCart = next;
    if (next.length) data.lastOrder = null;
  });
}

function saveRoute(data, ids, budget) {
  const account = data.accounts[data.session];
  const match = account.routes.find((route) => route.ids.join() === ids.join() && route.budget === budget);
  if (!match) account.routes.unshift({ id: crypto.randomUUID(), ids, budget });
}

function loyalty(account = activeAccount(), date = new Date()) {
  const spent = (account?.orders || []).filter((order) => {
    const placed = new Date(order.date);
    return placed.getFullYear() === date.getFullYear() && placed.getMonth() === date.getMonth();
  }).reduce((sum, order) => sum + order.total, 0);
  return { spent, rate: spent >= discountThreshold ? discountRate : 0 };
}

async function passwordHash(password, salt) {
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt: bytes.encode(salt), iterations: 150000, hash: 'SHA-256',
  }, key, 256);
  return Array.from(new Uint8Array(bits), (value) => value.toString(16).padStart(2, '0')).join('');
}

function openAccount(email, profile) {
  const pending = shop.pending;
  changeShop((data) => {
    if (profile) data.accounts[email] = profile;
    data.session = email;
    const account = data.accounts[email];
    account.cart = validIds([...account.cart, ...data.guestCart]);
    data.guestCart = [];
    if (pending?.ids.length) {
      saveRoute(data, pending.ids, pending.budget);
      data.pending = null;
    }
  });
  return Boolean(pending?.ids.length);
}
