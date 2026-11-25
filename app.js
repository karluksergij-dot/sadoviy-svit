/**
 * САДОВИЙ СВІТ — FRONTEND АРХІТЕКТУРА ТА БІЗНЕС-ЛОГІКА
 * 
 * Включає:
 * - Роботу з кошиком (LocalStorage, надійний калькулятор сум)
 * - Пагінацію «Показати ще» по 16 карток для миттєвої швидкості
 * - Автоматичне очищення назви сорту від повторюваного префікса «Саджанець: »
 * - Верхню лінію-акцент за категоріями (.cat-*)
 * - Дворядовий надійний нижній блок картки (ціна + степпер та кнопка «В кошик»)
 * - Виключення акційних наборів із загальної вкладки «Всі саджанці» (вони винесені в Hero/акційний блок)
 * - Індикатор «Вже у кошику: N шт.» прямо на кожній картці
 * - Кнопки категорій із живим підрахунком кількості сортів
 * - Швидке замовлення у Viber на номер 096 639 47 13
 * - Плаваючу кнопку «Вгору» та мобільні скрол-патерни Apple iOS
 */

// ============================================================
// НАЛАШТУВАННЯ TELEGRAM-БОТА
// ============================================================
const TELEGRAM_CONFIG = {
  isEnabled: true,
  botUsername: 'Sadovsviit_bot'
};

// ============================================================
// КОНТАКТИ РОЗПЛІДНИКА «САДОВИЙ СВІТ»
// ============================================================
const STORE_CONTACTS = {
  phone: "0966394713",
  phoneFormatted: "+38 (096) 639-47-13",
  viberNumber: "380966394713",
  showViber: true, // false = сховати всі кнопки Viber на сайті (лишаються телефон і замовлення на сайті)
  tiktokUrl: "https://www.tiktok.com/@lujbow_pirog777"
};

// Конфігурація пагінації та версіонування ассетів
// ============================================================
// ПРЕМІАЛЬНІ INLINE SVG-ІКОНКИ (LUCIDE STYLE, STROKE 1.75)
// ============================================================
const ICONS = {
  check: `<svg class="ui-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkLg: `<svg class="ui-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  clock: `<svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  search: `<svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  searchLg: `<svg class="ui-icon" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  bag: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  trash: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  x: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  sprout: `<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-9"/><path d="M12 13a5 5 0 0 0 5-5c0-3-2-5-5-5-3 0-5 2-5 5a5 5 0 0 0 5 5z"/></svg>`,
  flame: `<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
  leaf: `<svg class="ui-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`
};

function getCategorySvg(catId) {
  switch (catId) {
    case 'all':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`;
    case 'sets':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
    case 'apples':
    case 'pears':
    case 'peaches':
    case 'apricots':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a4 4 0 0 1 3 3.6 4 4 0 0 1 4 4.4C19 16 14.5 21 12 21S5 16 5 10a4 4 0 0 1 4-4.4A4 4 0 0 1 12 2z"/><path d="M12 2c0 3-2 4-2 4"/></svg>`;
    case 'cherries':
    case 'plums':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="7" cy="17" r="4"/><circle cx="17" cy="17" r="4"/><path d="M7 13c0-6 4-9 9-11"/><path d="M17 13c-2-4-2-7 0-9"/><path d="M9 4c2 0 4 1 7 0"/></svg>`;
    case 'grapes':
    case 'berries':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="2.5"/><circle cx="9" cy="11.5" r="2.5"/><circle cx="15" cy="11.5" r="2.5"/><circle cx="7" cy="16" r="2.5"/><circle cx="12" cy="16" r="2.5"/><circle cx="17" cy="16" r="2.5"/><circle cx="12" cy="20.5" r="2"/><path d="M12 2v2.5"/></svg>`;
    case 'exotics':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 8c0-3.5 2-6 5-6-1.5 2.5-1 4.5 0 6"/><path d="M11 8c0-3.5-2-6-5-6 1.5 2.5 1 4.5 0 6"/><path d="M12 8v14"/><path d="M4 14c2.5-1 4.5-.5 6 1"/><path d="M20 14c-2.5-1-4.5-.5-6 1"/></svg>`;
    case 'flowers':
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5z"/></svg>`;
    default:
      return `<svg class="ui-icon cat-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-9"/><path d="M12 13a5 5 0 0 0 5-5c0-3-2-5-5-5-3 0-5 2-5 5a5 5 0 0 0 5 5z"/></svg>`;
  }
}

const ASSET_VERSION = '2026.5.42';
const ITEMS_PER_PAGE = 16;
let visibleCount = ITEMS_PER_PAGE;

// Глобальний стан
let currentCategory = 'all';
let currentSearch = '';
let cart = [];
const MAX_QTY = 999; // розумна межа кількості одного товару

// ============================================================
// ІНІЦІАЛІЗАЦІЯ ПІСЛЯ ЗАВАНТАЖЕННЯ DOM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  initCategoryTabs();
  initCategoryDragScroll();
  initSearch();
  initBackToTop();
  renderPromoSets();
  renderCatalog();
  updateCategoryBanner(currentCategory);
  updateCartBadge();
  setupEventListeners();
});

// ============================================================
// РОБОТА З КОШИКОМ ТА КАЛЬКУЛЯТОР
// ============================================================
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('sadoviy_svit_cart');
    if (saved) {
      cart = JSON.parse(saved);
      // Ціну, назву й наявність беремо з ПОТОЧНОГО каталогу (у збереженому кошику вони могли застаріти)
      cart = (Array.isArray(cart) ? cart : []).map(item => {
        if (!item || !item.id) return null;
        const p = CATALOG_DATA.products.find(x => x.id === item.id);
        const qty = Math.min(MAX_QTY, parseInt(item.quantity, 10) || 0);
        if (!p || !(p.price > 0) || qty < 1) return null;
        return { id: p.id, name: p.name.replace(/^Саджанець[:\s]+/i, '').trim(), price: p.price, season: p.season || '', quantity: qty };
      }).filter(Boolean);
    }
  } catch (e) {
    console.error('Помилка читання кошика:', e);
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('sadoviy_svit_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Помилка збереження кошика:', e);
  }
  updateCartBadge();
  updateCardInCartIndicators();
}

function getCartTotals() {
  const totalCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const totalSum = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
  return { totalCount, totalSum };
}

function updateCartBadge() {
  const { totalCount, totalSum } = getCartTotals();
  
  const badges = document.querySelectorAll('.cart-count-badge, .mobile-cart-badge');
  badges.forEach(b => {
    b.textContent = totalCount;
    b.style.display = totalCount > 0 ? 'inline-block' : 'none';
  });

  const cartHeaderBtn = document.querySelector('.cart-btn-header');
  if (cartHeaderBtn) {
    const sumEl = cartHeaderBtn.querySelector('.cart-btn-sum');
    if (sumEl) {
      sumEl.textContent = totalSum > 0 ? `${totalSum} грн` : 'Кошик';
    }
  }
}

// Оновлення індикаторів «Вже у кошику: N шт.»
function updateCardInCartIndicators() {
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.id;
    if (!productId) return;

    const inCartItem = cart.find(i => i.id === productId);
    let indicator = card.querySelector('.product-in-cart-indicator');

    if (inCartItem && inCartItem.quantity > 0) {
      card.classList.add('has-in-cart');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'product-in-cart-indicator';
        const titleEl = card.querySelector('.product-name');
        if (titleEl) {
          titleEl.insertAdjacentElement('afterend', indicator);
        }
      }
      indicator.innerHTML = `${ICONS.check} Вже у кошику: <strong>${inCartItem.quantity} шт.</strong>`;
    } else {
      card.classList.remove('has-in-cart');
      if (indicator) {
        indicator.remove();
      }
    }
  });
}

// ============================================================
// ВИБІР ТА ПЕРЕМИКАННЯ КАТЕГОРІЙ
// ============================================================
function selectCategory(catId) {
  currentCategory = catId;
  visibleCount = ITEMS_PER_PAGE;

  // Оновлюємо стан верхніх головних кнопок (Всі саджанці / Акційні набори)
  const tabAll = document.getElementById('tabMainAll');
  const tabSets = document.getElementById('tabMainSets');
  if (tabAll) tabAll.classList.toggle('active', catId === 'all');
  if (tabSets) tabSets.classList.toggle('active', catId === 'sets');

  // Оновлюємо стан кнопок окремих видів у нижньому скролі
  document.querySelectorAll('.cat-tab-btn').forEach(btn => {
    const isActive = btn.dataset.category === catId;
    btn.classList.toggle('active', isActive);
  });

  updateCategoryBanner(catId);
  renderCatalog();
}

function updateCategoryBanner(catId) {
  const bannerContainer = document.getElementById('categoryShowcaseBanner');
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
  }
}

// ============================================================
// КАТЕГОРІЇ З ПІДРАХУНКОМ КІЛЬКОСТІ СОРТІВ
// ============================================================
function initCategoryTabs() {
  const container = document.getElementById('categoryTabs');
  if (!container || !CATALOG_DATA || !CATALOG_DATA.categories) return;

  // Оновлюємо лічильники для двох верхніх головних кнопок
  const totalAll = CATALOG_DATA.products.filter(p => p.category !== 'sets').length;
  const totalSets = CATALOG_DATA.products.filter(p => p.category === 'sets').length;
  const countAllBadge = document.getElementById('countAllBadge');
  const countSetsBadge = document.getElementById('countSetsBadge');
  if (countAllBadge) countAllBadge.textContent = totalAll;
  if (countSetsBadge) countSetsBadge.textContent = totalSets;

  container.innerHTML = '';
  // У нижню стрічку додаємо ТІЛЬКИ види рослин (без 'all' та 'sets')
  CATALOG_DATA.categories.forEach(cat => {
    if (cat.id === 'all' || cat.id === 'sets') return;

    const count = CATALOG_DATA.products.filter(p => p.category === cat.id).length;

    const btn = document.createElement('button');
    btn.className = `cat-tab-btn ${cat.id === currentCategory ? 'active' : ''}`;
    btn.dataset.category = cat.id;
    btn.innerHTML = `
      <span class="cat-icon cat-emoji" style="font-size: 1.25rem; line-height: 1;">${cat.icon || '🌱'}</span>
      <span class="cat-name">${cat.name.replace(/^[^\w\sа-яА-Яіїєґ]/u, '').trim()}</span>
      <span class="cat-count">${count}</span>
    `;
    btn.addEventListener('click', () => {
      selectCategory(cat.id);
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    container.appendChild(btn);
  });

  // Оновлюємо стрілки навігації та вішаємо слухачі скролу
  setTimeout(updateCategoryNavArrows, 50);
  container.removeEventListener('scroll', updateCategoryNavArrows);
  container.addEventListener('scroll', updateCategoryNavArrows, { passive: true });
  window.addEventListener('resize', updateCategoryNavArrows, { passive: true });
}

// ============================================================
// НАВІГАЦІЯ КАТЕГОРІЯМИ (СТРІЛКИ ДЛЯ ПК ТА СКРОЛЛ МИШКОЮ)
// ============================================================
function scrollCategories(direction) {
  const container = document.getElementById('categoryTabs');
  if (!container) return;
  // Скролимо приблизно на 3 вкладки або 70% ширини контейнера
  const scrollStep = Math.max(280, Math.floor(container.clientWidth * 0.7));
  const amount = direction === 'left' ? -scrollStep : scrollStep;
  container.scrollBy({ left: amount, behavior: 'smooth' });
  setTimeout(updateCategoryNavArrows, 320);
}

function updateCategoryNavArrows() {
  const container = document.getElementById('categoryTabs');
  const btnLeft = document.getElementById('catScrollLeft');
  const btnRight = document.getElementById('catScrollRight');
  const hintLeft = document.getElementById('scrollHintLeft');
  const hintRight = document.getElementById('scrollHintRight');

  if (!container) return;

  const scrollLeft = Math.round(container.scrollLeft);
  const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);

  // Стрілка вліво
  if (btnLeft) {
    if (scrollLeft > 15) {
      btnLeft.classList.add('visible');
      if (hintLeft) hintLeft.classList.add('visible');
    } else {
      btnLeft.classList.remove('visible');
      if (hintLeft) hintLeft.classList.remove('visible');
    }
  }

  // Стрілка вправо (для ПК та екранів, де є куди скролити)
  if (btnRight) {
    if (maxScroll > 15 && scrollLeft < maxScroll - 15) {
      btnRight.classList.add('visible');
      if (hintRight) hintRight.classList.add('visible');
    } else {
      btnRight.classList.remove('visible');
      if (hintRight) hintRight.classList.remove('visible');
    }
  }
}

function initCategoryDragScroll() {
  const slider = document.getElementById('categoryTabs');
  if (!slider) return;

  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let dragged = false;

  slider.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDown = true;
    dragged = false;
    slider.classList.add('grabbing');
    startX = e.pageX - slider.offsetLeft;
    startScrollLeft = slider.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      slider.classList.remove('grabbing');
      setTimeout(() => { dragged = false; }, 60);
    }
  });

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 5) {
      dragged = true;
    }
    slider.scrollLeft = startScrollLeft - walk;
    updateCategoryNavArrows();
  });

  slider.addEventListener('click', (e) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Горизонтальний скрол коліщатком миші на ПК
  slider.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0 && !e.shiftKey) {
      e.preventDefault();
      slider.scrollBy({ left: e.deltaY * 1.2, behavior: 'auto' });
      updateCategoryNavArrows();
    }
  }, { passive: false });
}

// ============================================================
// ПОШУК ПО КАТАЛОГУ
// ============================================================
function initSearch() {
  const searchInput = document.getElementById('catalogSearch');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      visibleCount = ITEMS_PER_PAGE;
      if (clearBtn) {
        clearBtn.style.display = currentSearch ? 'flex' : 'none';
      }
      renderCatalog();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        currentSearch = '';
        visibleCount = ITEMS_PER_PAGE;
        clearBtn.style.display = 'none';
        renderCatalog();
      }
    });
  }
}

// ============================================================
// РЕНДЕРИНГ АКЦІЙНИХ НАБОРІВ
// ============================================================
function formatSetVarieties(desc) {
  if (!desc) return '';
  if (desc.includes(':')) {
    const parts = desc.split(':', 1);
    const intro = parts[0].trim();
    const rest = desc.substring(desc.indexOf(':') + 1).trim();
    const dotIdx = rest.indexOf('.');
    const varietiesText = dotIdx !== -1 ? rest.substring(0, dotIdx) : rest;
    const extra = dotIdx !== -1 ? rest.substring(dotIdx + 1).trim() : '';

    const items = varietiesText.split(',').map(s => s.trim()).filter(Boolean);
    if (items.length >= 3) {
      const listHtml = items.map(item => `
        <li class="set-variety-item">
          <svg class="ui-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          <span>${escapeHtml(item)}</span>
        </li>
      `).join('');

      return `
        <div class="set-content-wrap">
          <details class="desc-plate" open><summary>Склад набору <span class="desc-chev" aria-hidden="true">⌄</span></summary>
          <p class="set-intro-text">${escapeHtml(intro)}:</p>
          <ul class="set-varieties-list">
            ${listHtml}
          </ul>
          ${extra ? `<p class="set-extra-text">${escapeHtml(extra)}</p>` : ''}</details>
        </div>
      `;
    }
  }
  return `<p class="set-desc">${escapeHtml(desc)}</p>`;
}

let promoSetsExpanded = false;

function renderPromoSets() {
  const container = document.getElementById('promoSetsGrid');
  if (!container || !CATALOG_DATA) return;

  const sets = CATALOG_DATA.products.filter(p => p.category === 'sets');
  container.innerHTML = '';

  const initialLimit = window.innerWidth >= 992 ? 3 : 2; // ПК: 3 в ряд; мобільні: 2 для швидкого переходу до каталогу

  sets.forEach((set, idx) => {
    const card = document.createElement('div');
    card.className = 'set-card';
    if (!promoSetsExpanded && idx >= initialLimit) {
      card.classList.add('set-card-collapsed');
      card.style.display = 'none';
    }
    card.innerHTML = `
      <div class="set-card-media" onclick="openImagePreview('${set.image}?v=${ASSET_VERSION}', '${escapeHtml(set.name)}')">
        <img src="${(set.cardImage || set.image)}?v=${ASSET_VERSION}" alt="${escapeHtml(set.name)}" loading="lazy">
        <span class="set-badge-float">${set.badge || 'ТОП-Набір'}</span>
        <button class="set-zoom-btn" type="button" aria-label="Збільшити фото" title="Збільшити фото">
          ${ICONS.search}
        </button>
      </div>
      <div class="set-card-body">
        <h3 class="set-title">${escapeHtml(set.name)}</h3>
        ${formatSetVarieties(set.desc)}
        <div class="set-bottom-block">
          <div class="set-price-bar">
            <div class="price-box">
              <span class="price-main">${set.price} грн</span>
              ${set.oldPrice ? `<span class="price-old">${set.oldPrice} грн</span>` : ''}
            </div>
            <span class="set-badge-stock">${ICONS.check} В наявності</span>
          </div>
          <button class="btn-buy-set" id="btnSet_${set.id}" onclick="addSetToCart('${set.id}')">
            ${ICONS.bag} Замовити набір (${set.price} грн)
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Кнопка перемикання "Показати ще акційні набори"
  let toggleWrap = document.getElementById('promoSetsToggleWrap');
  if (!toggleWrap) {
    toggleWrap = document.createElement('div');
    toggleWrap.id = 'promoSetsToggleWrap';
    toggleWrap.className = 'promo-sets-toggle-wrap';
    container.parentNode.appendChild(toggleWrap);
  }

  const remainingCount = sets.length - initialLimit;
  if (remainingCount > 0) {
    toggleWrap.style.display = 'flex';
    toggleWrap.innerHTML = `
      <button type="button" class="btn-toggle-sets" onclick="togglePromoSets()">
        <span>${promoSetsExpanded ? 'Згорнути акційні набори' : `Показати ще ${remainingCount} акційні набори`}</span>
        <svg class="ui-icon" style="transform: ${promoSetsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}; transition: transform 0.25s;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
    `;
  } else {
    toggleWrap.style.display = 'none';
  }
}

function togglePromoSets() {
  promoSetsExpanded = !promoSetsExpanded;
  renderPromoSets();
  if (!promoSetsExpanded) {
    const el = document.getElementById('promoSetsSection');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function addSetToCart(setId) {
  addToCart(setId, 1, false);
  const btn = document.getElementById(`btnSet_${setId}`);
  if (btn) {
    const orig = btn.innerHTML;
    btn.style.background = '#0B2416';
    btn.innerHTML = `${ICONS.check} Набір додано в кошик!`;
    setTimeout(() => {
      btn.style.background = '';
      btn.innerHTML = orig;
    }, 1400);
  }
}

// ============================================================
// РЕНДЕРИНГ КАТАЛОГУ (3 ПРОСТОРІ КОЛОНКИ, БЕЗ ЗЛАМАНИХ ПЕРЕНОСІВ)
// ============================================================
function renderCatalog() {
  const container = document.getElementById('catalogGrid');
  const countEl = document.getElementById('catalogCount');
  const paginationWrap = document.getElementById('paginationWrap');
  const loadMoreText = document.getElementById('loadMoreText');
  if (!container || !CATALOG_DATA) return;

  let filtered = CATALOG_DATA.products;

  // У вкладці 'all' показуємо тільки поштучні саджанці (без наборів)
  if (currentCategory === 'all') {
    filtered = filtered.filter(p => p.category !== 'sets');
  } else {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Пошук
  if (currentSearch) {
    const q = currentSearch;
    filtered = filtered.filter(p => {
      return p.name.toLowerCase().includes(q) ||
             (p.desc && p.desc.toLowerCase().includes(q)) ||
             (p.season && p.season.toLowerCase().includes(q));
    });
  }

  const totalFiltered = filtered.length;
  if (countEl) {
    countEl.textContent = `Знайдено: ${totalFiltered} сортів`;
  }

  if (totalFiltered === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: #fff; border-radius: 18px; border: 1px solid var(--border-card);">
        <div style="display: flex; justify-content: center; margin-bottom: 14px; color: var(--cta-primary);">${ICONS.searchLg}</div>
        <h3 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--text-headline); margin-bottom: 8px; font-weight: 700;">Нічого не знайдено за вашим запитом</h3>
        <p style="color: var(--text-muted); font-size: 1rem;">Спробуйте змінити слово або обрати іншу категорію зверху</p>
      </div>
    `;
    if (paginationWrap) paginationWrap.style.display = 'none';
    return;
  }

  // Зріз пагінації
  const visibleItems = filtered.slice(0, visibleCount);

  container.innerHTML = '';
  visibleItems.forEach(p => {
    // Прибираємо префікс «Саджанець: » або «Саджанець »
    const cleanName = p.name.replace(/^Саджанець[:\s]+/i, '').trim();
    // Назва: головна частина + (уточнення в дужках) окремим підзаголовком
    const _m = cleanName.match(/^(.*?)\s*\((.+)\)\s*$/);
    const nameMain = _m ? _m[1].trim() : cleanName;
    const nameSub = _m ? _m[2].trim() : '';

    const catObj = CATALOG_DATA.categories.find(c => c.id === p.category);
    const catName = catObj ? catObj.name.replace(/^[^\w\sа-яА-Яіїєґ]/u, '').trim() : 'Саджанці';
    const _catShort = {apples:'Яблуні', pears:'Груші', peaches:'Персики', apricots:'Абрикоси', cherries:'Черешні', plums:'Сливи', grapes:'Виноград', berries:'Ягоди', exotics:'Екзоти', flowers:'Квіти', sets:'Набір'};
    const catLabel = _catShort[p.category] || catName;
    const catSvg = getCategorySvg(p.category);

    const inCartItem = cart.find(i => i.id === p.id);
    const inCartQty = inCartItem ? inCartItem.quantity : 0;

    const card = document.createElement('div');
    card.className = `product-card cat-${p.category} ${inCartQty > 0 ? 'has-in-cart' : ''}`;
    card.dataset.id = p.id;

    card.innerHTML = `
      ${p.image ? `
        <div class="product-card-img" onclick="openImagePreview('${p.image}?v=${ASSET_VERSION}', '${escapeHtml(cleanName)}')">
          <img src="${p.image}?v=${ASSET_VERSION}" alt="${escapeHtml(cleanName)}" loading="lazy">
          <button class="img-zoom-btn" type="button" aria-label="Збільшити фото" title="Збільшити фото">
            ${ICONS.search}
          </button>
        </div>
      ` : ''}
      <div class="product-card-body">
        <div class="product-top-row">
          <span class="product-category-tag"><span class="card-cat-emoji" style="font-size: 1rem; line-height: 1; vertical-align: middle;">${catObj && catObj.icon ? catObj.icon : '🌱'}</span><span class="tag-text">${catLabel}</span></span>
        </div>
        <h3 class="product-name">${escapeHtml(nameMain)}</h3>
        ${nameSub ? `<p class="product-subname">${escapeHtml(nameSub)}</p>` : ''}
        ${p.season ? `<p class="product-season-line"><span class="season-ico">${ICONS.clock}</span><span class="season-txt">${escapeHtml(p.season)}</span></p>` : ''}
        ${inCartQty > 0 ? `<div class="product-in-cart-indicator">${ICONS.check} Вже у кошику: <strong>${inCartQty} шт.</strong></div>` : ''}
        ${p.desc ? `<details class="desc-plate"><summary>Про сорт <span class="desc-chev" aria-hidden="true">⌄</span></summary><p class="product-desc">${escapeHtml(p.desc)}</p></details>` : ''}
        <div class="product-bottom-block">
          <div class="product-price-row">
            <div class="product-price-val">${p.price} грн</div>
            <div class="product-price-unit">${p.isSet ? 'за весь набір' : 'за 1 саджанець'}</div>
          </div>
          <div class="product-buy-row">
            <div class="card-qty-stepper">
              <button class="card-qty-btn" type="button" onclick="stepCardQty('${p.id}', -1)" aria-label="Зменшити">−</button>
              <span class="card-qty-val" id="cardQty_${p.id}">1</span>
              <button class="card-qty-btn" type="button" onclick="stepCardQty('${p.id}', 1)" aria-label="Збільшити">+</button>
            </div>
            <button class="btn-add-cart" id="btnBuy_${p.id}" type="button" onclick="addFromCard('${p.id}')">
              <span>В кошик</span> ${ICONS.bag}
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Пагінація
  if (paginationWrap) {
    if (totalFiltered > visibleCount) {
      paginationWrap.style.display = 'block';
      const remaining = totalFiltered - visibleCount;
      if (loadMoreText) {
        loadMoreText.textContent = `Показати ще (${remaining} ${getWordEnding(remaining, ['сорт', 'сорти', 'сортів'])})`;
      }
    } else {
      paginationWrap.style.display = 'none';
    }
  }
}

function loadMoreProducts() {
  visibleCount += ITEMS_PER_PAGE;
  renderCatalog();
}

function getWordEnding(num, forms) {
  const n = Math.abs(num) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

// ============================================================
// ДІЇ З КАРТКОЮ
// ============================================================
function stepCardQty(productId, delta) {
  const el = document.getElementById(`cardQty_${productId}`);
  if (!el) return;
  let val = parseInt(el.textContent, 10) || 1;
  val += delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  el.textContent = val;
}

function addFromCard(productId) {
  const el = document.getElementById(`cardQty_${productId}`);
  const qty = el ? (parseInt(el.textContent, 10) || 1) : 1;
  addToCart(productId, qty, false);

  const btn = document.getElementById(`btnBuy_${productId}`);
  if (btn) {
    const origHtml = btn.innerHTML;
    btn.classList.add('added');
    btn.innerHTML = `<span>${ICONS.check} Додано!</span>`;
    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = origHtml;
    }, 1200);
  }
}

function addToCart(productId, quantity = 1, showCartDrawer = false) {
  const product = CATALOG_DATA.products.find(p => p.id === productId);
  if (!product) return;

  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const cleanName = product.name.replace(/^Саджанець[:\s]+/i, '').trim();

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity = Math.min(MAX_QTY, existing.quantity + qty);
  } else {
    cart.push({
      id: product.id,
      name: cleanName,
      price: product.price,
      season: product.season || '',
      quantity: qty
    });
  }

  saveCartToStorage();
  showToast(`${ICONS.check} Додано в кошик: ${cleanName} (${qty} шт.)`);

  if (showCartDrawer) {
    openCartModal();
  }
}

// ============================================================
// КЕРУВАННЯ КОШИКОМ
// ============================================================
function changeCartItemQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity = Math.min(MAX_QTY, (parseInt(item.quantity, 10) || 1) + delta);
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCartToStorage();
  renderCartModal();
}

function removeCartItem(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage();
  renderCartModal();
}

function clearCart() {
  if (confirm('Бажаєте повністю очистити кошик?')) {
    cart = [];
    saveCartToStorage();
    renderCartModal();
  }
}

function renderCartModal() {
  const container = document.getElementById('cartItemsContainer');
  const totalBox = document.getElementById('cartTotalBox');
  const orderForm = document.getElementById('orderForm');
  if (!container || !totalBox) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-state" style="text-align: center; padding: 40px 16px;">
        <div class="cart-empty-icon" style="display: flex; justify-content: center; margin-bottom: 16px; color: var(--cta-primary);">
          <svg class="ui-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <h4 style="font-family: var(--font-serif); font-size: 1.35rem; color: var(--text-headline); margin-bottom: 8px; font-weight: 700;">Ваш кошик порожній</h4>
        <p style="font-size: 1rem; color: var(--text-muted); margin-bottom: 24px;">Оберіть сортові саджанці або акційні набори у нашому каталозі</p>
        <button class="btn-hero-primary" style="justify-content: center; width: auto; min-width: 220px; margin: 0 auto;" onclick="closeModal('cartModal')">Перейти до покупок</button>
      </div>
    `;
    totalBox.style.display = 'none';
    if (orderForm) orderForm.style.display = 'none';
    return;
  }

  totalBox.style.display = 'flex';
  if (orderForm) orderForm.style.display = 'block';

  const { totalSum, totalCount } = getCartTotals();
  let itemsHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
      <span style="font-size:0.95rem; color:#627367; font-weight:700;">Всього у кошику: ${totalCount} шт.</span>
      <button style="background:none; border:none; color:#B02A2A; font-size:0.88rem; font-weight:700; cursor:pointer;" onclick="clearCart()">${ICONS.trash} Очистити</button>
    </div>
    <div class="cart-items-list">
  `;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    itemsHtml += `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <div class="cart-item-title">${escapeHtml(item.name)}</div>
          <div class="cart-item-meta">${item.price} грн × ${item.quantity} шт.</div>
        </div>
        <div class="card-qty-stepper">
          <button class="card-qty-btn" type="button" onclick="changeCartItemQty('${item.id}', -1)" aria-label="Зменшити">−</button>
          <span class="card-qty-val">${item.quantity}</span>
          <button class="card-qty-btn" type="button" onclick="changeCartItemQty('${item.id}', 1)" aria-label="Збільшити">+</button>
        </div>
        <div class="cart-item-price">${itemTotal} грн</div>
        <button class="cart-item-remove" type="button" title="Видалити" onclick="removeCartItem(\'${item.id}\')" aria-label="Видалити">${ICONS.trash}</button>
      </div>
    `;
  });
  itemsHtml += '</div>';

  container.innerHTML = itemsHtml;
  document.getElementById('cartTotalSum').innerHTML = `<span class="total-sum-val">${totalSum} грн</span>`;
}

let cartModalOpenedAt = Date.now();

function openCartModal() {
  cartModalOpenedAt = Date.now();
  renderCartModal();
  openModal('cartModal');
}

// ============================================================
// ОФОРМЛЕННЯ ЗАМОВЛЕННЯ ТА VIBER
// ============================================================
async function handleOrderSubmit(e, viaViber = false) {
  if (e) e.preventDefault();

  if (cart.length === 0) {
    alert('Будь ласка, додайте саджанці до кошика!');
    return;
  }

  // Захист від повторних спам-кліків (кулдаун 15 секунд)
  const lastOrderTs = sessionStorage.getItem('last_order_ts');
  const now = Date.now();
  if (lastOrderTs && now - parseInt(lastOrderTs, 10) < 8000) {
    alert('Ваше замовлення вже обробляється! Наш менеджер зателефонує вам найближчим часом для підтвердження.');
    return;
  }

  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = composeDeliveryAddress();
  const payment = document.getElementById('paymentMethod').value;
  const comment = document.getElementById('customerComment').value.trim();

  // Honeypot перевірка (приховане поле-пастка)
  const honeypotVal = document.getElementById('orderWebsite') ? document.getElementById('orderWebsite').value.trim() : '';
  const formTimeMs = now - (cartModalOpenedAt || now);

  clearFieldErrors();
  if (!name) { showFieldError('customerName', 'Вкажіть, будь ласка, ім’я'); return; }
  if (!phone) { showFieldError('customerPhone', 'Вкажіть номер телефону, щоб ми могли зателефонувати'); return; }
  const phoneDigits = phone.replace(/[^\d]/g, '');
  if (phoneDigits.length < 9) {
    showFieldError('customerPhone', 'Перевірте номер: потрібно 10 цифр, наприклад 096 639 47 13');
    return;
  }
  // Область і населений пункт: вводяться вручну (будь-яке село України)
  const regionEl = document.getElementById('customerRegion');
  const cityEl = document.getElementById('customerAddress');
  if (!regionEl || !regionEl.value) { showFieldError('customerRegion', 'Оберіть область'); return; }
  if (!cityEl || cityEl.value.trim().length < 2) { showFieldError('customerAddress', 'Вкажіть місто або село'); return; }

  const submitBtn = document.getElementById('btnSubmitOrder');
  const viberBtnForm = document.getElementById('btnViberOrder');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Відправляємо...';
  }
  if (viberBtnForm) viberBtnForm.disabled = true;

  const orderId = 'SS-' + Math.floor(100000 + Math.random() * 900000);
  const { totalSum } = getCartTotals();

  const orderData = {
    orderId,
    date: new Date().toLocaleString('uk-UA'),
    name,
    phone,
    address,
    payment,
    comment,
    items: [...cart],
    totalSum
  };

  // 1. Відправляємо в Telegram-бот через захищену Vercel Serverless функцію з антиспамом
  let telegramSent = false;
  if (TELEGRAM_CONFIG.isEnabled) {
    try {
      telegramSent = await sendToTelegram(orderData, honeypotVal, formTimeMs);
    } catch (err) {
      console.warn('Помилка відправки в Telegram:', err);
    }
  }

  // Таймстемп ставимо лише після успішної відправки (щоб повторна спроба після збою не блокувалась)
  if (telegramSent) sessionStorage.setItem('last_order_ts', Date.now().toString());

  // 2. Якщо клієнт натиснув "Замовити через Viber"
  if (viaViber) {
    sendToViber(orderData);
    finalizeOrder(orderData, telegramSent);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${ICONS.bag} Відправити замовлення менеджеру`;
    }
    if (viberBtnForm) viberBtnForm.disabled = false;
    resetOrderForm();
    return;
  }

  // 3. Звичайне оформлення через сайт
  finalizeOrder(orderData, telegramSent);
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `${ICONS.bag} Відправити замовлення менеджеру`;
  }
  if (viberBtnForm) viberBtnForm.disabled = false;
  resetOrderForm();
}

async function sendToTelegram(order, honeypot = '', formTime = 0) {
  if (!TELEGRAM_CONFIG.isEnabled) {
    return false;
  }

  try {
    let msg = `🌿 <b>НОВЕ ЗАМОВЛЕННЯ #${order.orderId}</b>\n\n`;
    msg += `👤 <b>Клієнт:</b> ${escapeHtml(order.name)}\n`;
    msg += `📞 <b>Телефон:</b> <a href="tel:${order.phone.replace(/[^\d+]/g, '')}">${escapeHtml(order.phone)}</a>\n`;
    if (order.address) {
      msg += `📍 <b>Доставка:</b> ${escapeHtml(order.address)}\n`;
    }
    if (order.payment) {
      msg += `💳 <b>Оплата:</b> ${escapeHtml(order.payment)}\n`;
    }
    if (order.comment) {
      msg += `💬 <b>Коментар:</b> ${escapeHtml(order.comment)}\n`;
    }
    msg += `\n📦 <b>Замовлені саджанці:</b>\n`;
    order.items.forEach((item, i) => {
      msg += `${i + 1}. <b>${escapeHtml(item.name)}</b> — ${item.quantity} шт. × ${item.price} грн = <b>${item.price * item.quantity} грн</b>\n`;
    });
    msg += `\n💰 <b>ЗАГАЛЬНА СУМА:</b> <b>${order.totalSum} грн</b>\n`;
    msg += `⏰ <i>${order.date}</i>`;

    window.__orderErr = '';
    const _ac = new AbortController();
    const _to = setTimeout(() => _ac.abort(), 20000);
    const resp = await fetch('/api/order', {
      method: 'POST',
      signal: _ac.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: msg,
        orderId: order.orderId,
        website: honeypot,
        formTime: formTime,
        order: {
          orderId: order.orderId, name: order.name, phone: order.phone, address: order.address,
          payment: order.payment, comment: order.comment, totalSum: order.totalSum,
          items: (order.items || []).map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
        }
      })
    });

    clearTimeout(_to);
    const data = await resp.json();
    if (!data.ok) {
      window.__orderErr = 'HTTP ' + resp.status + (data.error ? ' · ' + String(data.error).slice(0, 80) : '');
      console.warn('Telegram response:', data);
    }
    return data.ok === true && !data.filtered;
  } catch (err) {
    window.__orderErr = 'мережа: ' + String((err && err.message) || err).slice(0, 80);
    console.error('Помилка надсилання в Telegram:', err);
    return false;
  }
}

function buildViberText(order) {
  let msg = `Добрий день! Оформлюю замовлення #${order.orderId} на саджанці:
`;
  msg += `Ім'я: ${order.name}
`;
  msg += `Телефон: ${order.phone}
`;
  if (order.address) msg += `Доставка: ${order.address}
`;
  msg += `
Товари:
`;
  order.items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} - ${item.quantity} шт. (${item.price * item.quantity} грн)
`;
  });
  msg += `
Загальна сума: ${order.totalSum} грн.`;
  return msg;
}

// Копіювання тексту в буфер обміну (працює і на старих телефонах)
function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
      return true;
    }
  } catch (e) {}
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
    document.body.appendChild(ta);
    ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) { return false; }
}

function sendToViber(order) {
  const msg = buildViberText(order);
  // Viber не завжди підставляє текст у чат сам, тому копіюємо замовлення в буфер — клієнту лишається «Вставити»
  const copied = copyToClipboard(msg);
  if (copied) showToast('Скопійовано. У Viber натисніть «Вставити».');

  const encoded = encodeURIComponent(msg);
  const viberUrl = `viber://chat?number=%2B${STORE_CONTACTS.viberNumber}&text=${encoded}`;
  setTimeout(() => window.open(viberUrl, '_blank'), copied ? 700 : 0);
}

function finalizeOrder(order, telegramSent = false) {
  closeModal('cartModal');

  document.getElementById('successOrderId').textContent = order.orderId;
  document.getElementById('successOrderPhone').textContent = order.phone;
  document.getElementById('successOrderSum').textContent = `${order.totalSum} грн`;

  // Зберігаємо замовлення, щоб у разі збою передати його у Viber повністю (зі складом)
  window.__lastOrder = order;
  window.__lastOrderFailed = !telegramSent;

  const modal = document.getElementById('successModal');
  const mTitle = modal.querySelector('.modal-title');
  const sTitle = modal.querySelector('.success-title');
  const sLead = modal.querySelector('.success-lead');
  const viberBtn = modal.querySelector('.btn-submit-viber');
  const botTitle = document.getElementById('botNoticeTitle');
  const botDesc = document.getElementById('botNoticeDesc');
  const mgrLine = botDesc ? botDesc.nextElementSibling : null;

  // Запам'ятовуємо початкові тексти (для успішного сценарію)
  [[mTitle, 'm'], [sTitle, 's'], [sLead, 'l'], [viberBtn, 'v']].forEach(([el, k]) => {
    if (el && el.dataset['orig' + k] === undefined) el.dataset['orig' + k] = el.innerHTML;
  });

  document.body.classList.toggle('order-failed', !telegramSent);
  if (telegramSent) {
    if (mTitle) mTitle.innerHTML = mTitle.dataset.origm;
    if (sTitle) sTitle.innerHTML = sTitle.dataset.origs;
    if (sLead) sLead.innerHTML = sLead.dataset.origl;
    if (viberBtn) viberBtn.innerHTML = 'Написати нам у Viber';
    if (mgrLine) mgrLine.style.display = 'none';
    if (botTitle && botDesc) {
      botTitle.innerHTML = `${ICONS.check} Ми вам зателефонуємо`;
      botDesc.innerHTML = 'Менеджер зв\'яжеться з вами найближчим часом, щоб підтвердити наявність та домовитись про відправку Новою Поштою.';
    }
  } else {
    if (mTitle) mTitle.textContent = 'Останній крок';
    if (sTitle) sTitle.textContent = 'Надішліть замовлення у Viber';
    if (sLead) sLead.textContent = 'Автоматично передати замовлення нам не вдалося — це не ваша помилка. Щоб ми точно його отримали, натисніть фіолетову кнопку нижче.';
    if (viberBtn) viberBtn.innerHTML = 'Надіслати замовлення у Viber';
    if (mgrLine) mgrLine.style.display = 'none';
    if (botTitle && botDesc) {
      botTitle.textContent = 'Або зателефонуйте нам';
      botDesc.innerHTML = '<b>096 639 47 13</b><br><small style="opacity:.7">Код: ' + (window.__orderErr || '—') + '</small>';
    }
  }

  cart = [];
  saveCartToStorage();

  openModal('successModal');
}

function copyCurrentOrder() {
  if (!window.__lastOrder) return;
  const ok = copyToClipboard(buildViberText(window.__lastOrder));
  showToast(ok ? 'Замовлення скопійовано' : 'Не вдалося скопіювати — виділіть текст вручну');
}

function sendCurrentOrderToViber() {
  if (window.__lastOrder) { sendToViber(window.__lastOrder); return; }
  const orderId = document.getElementById('successOrderId').textContent;
  const phone = document.getElementById('successOrderPhone').textContent;
  const sum = document.getElementById('successOrderSum').textContent;

  const msg = `Добрий день! Я оформив замовлення #${orderId} на сайті «Садовий світ». Мій телефон: ${phone}. Сума: ${sum}. Прошу підтвердити наявність та відправку!`;
  const url = `viber://chat?number=%2B${STORE_CONTACTS.viberNumber}&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// ============================================================
// ПРЕВ'Ю ЗОБРАЖЕНЬ ТА МОДАЛЬНІ ВІКНА
// ============================================================
function openImagePreview(src, alt) {
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('imagePreviewTarget');
  const caption = document.getElementById('imagePreviewCaption');
  if (img) img.src = src;
  if (caption) caption.textContent = alt || '';
  openModal('imageModal');
}

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('open');
  document.body.style.overflow = '';
}

// Toast сповіщення
let toastTimer = null;
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = message;
  toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// Навігація до каталогу
function scrollToCatalog(categoryId) {
  if (categoryId === 'sets') {
    promoSetsExpanded = true;
    renderPromoSets();
    selectCategory('sets');
    const el = document.getElementById('promoSetsSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    if (categoryId) {
      selectCategory(categoryId);
    }
    const el = document.getElementById('catalogSection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

// Плаваюча кнопка «Вгору»
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Глобальні слухачі подій
function setupEventListeners() {
  document.querySelectorAll('.modal-backdrop').forEach(b => {
    b.addEventListener('click', (e) => {
      if (e.target === b) {
        b.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => handleOrderSubmit(e, false));
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Перерахунок кількості наборів при переході між мобільним і ПК розміром
(function () {
  let wasDesktop = window.innerWidth >= 992;
  window.addEventListener('resize', function () {
    const isDesktop = window.innerWidth >= 992;
    if (isDesktop !== wasDesktop) { wasDesktop = isDesktop; if (typeof renderPromoSets === 'function') renderPromoSets(); }
  }, { passive: true });
})();

// Перемикач: сховати Viber на сайті, якщо власниця цього хоче
if (typeof STORE_CONTACTS !== 'undefined' && STORE_CONTACTS.showViber === false) {
  document.body.classList.add('no-viber');
}


// ============================================================
// ФОРМА ЗАМОВЛЕННЯ: інлайн-помилки, маска телефону, очищення після відправки
// ============================================================
function clearFieldErrors() {
  document.querySelectorAll('#orderForm .field-error').forEach(e => e.remove());
  document.querySelectorAll('#orderForm .has-error').forEach(e => e.classList.remove('has-error'));
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.add('has-error');
  const err = document.createElement('div');
  err.className = 'field-error';
  err.setAttribute('role', 'alert');
  err.textContent = message;
  input.insertAdjacentElement('afterend', err);
  try { input.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
  input.focus({ preventScroll: true });
}

function formatUaPhone(raw) {
  const original = String(raw || '');
  const t = original.trim();
  // форматуємо лише українські номери (0.., 38.., +38..); інші лишаємо як є
  if (!(t.startsWith('+38') || t.startsWith('0') || t.startsWith('38'))) return original;
  let d = original.replace(/\D/g, '');
  if (d.startsWith('380')) d = d.slice(2);
  else if (d.startsWith('38')) d = d.slice(2);
  d = d.slice(0, 10);
  if (!d) return '';
  let out = '+38 (' + d.slice(0, 3);
  if (d.length > 3) out += ') ' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

function resetOrderForm() {
  ['customerAddress', 'customerDistrict', 'customerComment', 'orderWebsite', 'customerBranchNum'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const rg = document.getElementById('customerRegion'); if (rg) rg.value = '';
  clearFieldErrors();
}

(function initOrderFormHelpers() {
  function setup() {
    const phone = document.getElementById('customerPhone');
    if (phone && !phone.dataset.fmtReady) {
      phone.dataset.fmtReady = '1';
      phone.addEventListener('input', () => {
        const before = phone.value;
        const after = formatUaPhone(before);
        if (after !== before) phone.value = after;
      });
    }
    document.querySelectorAll('#orderForm .form-input, #orderForm .form-textarea, #orderForm .form-select').forEach(el => {
      el.addEventListener('input', () => {
        el.classList.remove('has-error');
        const nxt = el.nextElementSibling;
        if (nxt && nxt.classList.contains('field-error')) nxt.remove();
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();


// ============================================================
// АДРЕСА ДОСТАВКИ: населений пункт + номер відділення Нової Пошти
// ============================================================
function composeDeliveryAddress() {
  const val = (id) => { const el = document.getElementById(id); return el ? el.value.replace(/\s+/g, ' ').trim() : ''; };
  const region = val('customerRegion');
  const city = val('customerAddress');
  let district = val('customerDistrict');
  // «Сокирянський», «Сокирянський р-н», «Сокирянський рн», «Сокирянський район» → завжди «Сокирянський район»
  district = district.replace(/[\s,.]+(район|р-н|р-он|рн|р)[\s.]*$/i, '').replace(/^(район|р-н)[\s.]+/i, '').trim();
  if (district) district = district.charAt(0).toUpperCase() + district.slice(1) + ' район';
  const num = (document.getElementById('customerBranchNum') || { value: '' }).value.replace(/\D/g, '');
  const parts = [region, district, city].filter(Boolean);
  let addr = parts.join(', ');
  if (num) addr += (addr ? ', ' : '') + 'Нова Пошта, відділення №' + num;
  return addr;
}

(function initBranchNumber() {
  function setup() {
    const n = document.getElementById('customerBranchNum');
    if (!n || n.dataset.ready) return;
    n.dataset.ready = '1';
    n.addEventListener('input', () => { const d = n.value.replace(/\D/g, ''); if (d !== n.value) n.value = d; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
