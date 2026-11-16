const themePreference = 'codepath-theme';
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

function getTheme() {
  try {
    const savedTheme = localStorage.getItem(themePreference);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch {
    // Some browsers block storage when opening a local HTML file.
  }
  return systemTheme.matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.bsTheme = theme;
  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

applyTheme(getTheme());

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getTheme());
  const toggle = document.querySelector('[data-theme-toggle]');
  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(themePreference, nextTheme);
    } catch {
      // The toggle still works for the current page.
    }
    applyTheme(nextTheme);
  });
});
