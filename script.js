// Estado inicial carregado da memória do celular (localStorage)
let items = JSON.parse(localStorage.getItem('s23_shopping_list')) || [
  { id: 1, name: 'Arroz 5kg', bought: false },
  { id: 2, name: 'Feijão Carioca', bought: false },
  { id: 3, name: 'Café em pó', bought: true }
];

let currentTab = 'to-buy'; // 'to-buy' ou 'bought'

// Elementos da Tela
const shoppingListEl = document.getElementById('shopping-list');
const emptyStateEl = document.getElementById('empty-state');
const pageTitleEl = document.getElementById('page-title');
const sectionHintEl = document.getElementById('section-hint');
const addBarEl = document.getElementById('add-bar');
const addFormEl = document.getElementById('add-form');
const itemInputEl = document.getElementById('item-input');

// Contadores do Menu
const badgeToBuyEl = document.getElementById('badge-to-buy');
const badgeBoughtEl = document.getElementById('badge-bought');

// Menu Lateral
const sideMenuEl = document.getElementById('side-menu');
const drawerOverlayEl = document.getElementById('drawer-overlay');
const menuBtn = document.getElementById('menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const navItems = document.querySelectorAll('.nav-item');

// Modal de Importação
const importModalEl = document.getElementById('import-modal');
const importBtn = document.getElementById('import-btn');
const openImportMenuBtn = document.getElementById('open-import-menu');
const cancelImportBtn = document.getElementById('cancel-import');
const confirmImportBtn = document.getElementById('confirm-import');
const bulkTextareaEl = document.getElementById('bulk-textarea');

// Salva no navegador
function saveItems() {
  localStorage.setItem('s23_shopping_list', JSON.stringify(items));
  updateBadges();
}

function updateBadges() {
  const toBuyCount = items.filter(item => !item.bought).length;
  const boughtCount = items.filter(item => item.bought).length;
  badgeToBuyEl.textContent = toBuyCount;
  badgeBoughtEl.textContent = boughtCount;
}

// Renderiza a lista na tela
function renderList() {
  shoppingListEl.innerHTML = '';
  updateBadges();

  const filteredItems = items.filter(item => 
    currentTab === 'to-buy' ? !item.bought : item.bought
  );

  // Atualiza textos da aba atual
  if (currentTab === 'to-buy') {
    pageTitleEl.textContent = 'Para Comprar';
    sectionHintEl.textContent = 'Marque o checkbox quando colocar no carrinho';
    addBarEl.classList.remove('hidden');
  } else {
    pageTitleEl.textContent = 'Já Comprados';
    sectionHintEl.textContent = 'Desmarque um item para enviá-lo de volta à lista de compras';
    addBarEl.classList.add('hidden');
  }

  if (filteredItems.length === 0) {
    emptyStateEl.classList.remove('hidden');
    return;
  } else {
    emptyStateEl.classList.add('hidden');
  }

  filteredItems.forEach(item => {
    const li = document.createElement('li');
    li.className = `list-item ${item.bought ? 'bought' : ''}`;
    
    li.innerHTML = `
      <div class="item-left" onclick="toggleItem(${item.id}, this.parentElement)">
        <div class="custom-checkbox"></div>
        <span class="item-text">${escapeHtml(item.name)}</span>
      </div>
      <button class="delete-btn" onclick="deleteItem(${item.id})" aria-label="Excluir">✕</button>
    `;

    shoppingListEl.appendChild(li);
  });
}

// Alterna status (Para Comprar <-> Já Comprados) com animação
window.toggleItem = function(id, element) {
  element.classList.add('moving');
  
  setTimeout(() => {
    items = items.map(item => {
      if (item.id === id) {
        return { ...item, bought: !item.bought };
      }
      return item;
    });
    saveItems();
    renderList();
  }, 220);
};

// Exclui um item permanentemente
window.deleteItem = function(id) {
  items = items.filter(item => item.id !== id);
  saveItems();
  renderList();
};

// Adiciona novo item individual
addFormEl.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = itemInputEl.value.trim();
  if (!text) return;

  items.unshift({
    id: Date.now(),
    name: text,
    bought: false
  });

  itemInputEl.value = '';
  saveItems();
  renderList();
});

// Controles do Menu Lateral
function openMenu() {
  sideMenuEl.classList.add('open');
  drawerOverlayEl.classList.remove('hidden');
}

function closeMenu() {
  sideMenuEl.classList.remove('open');
  drawerOverlayEl.classList.add('hidden');
}

menuBtn.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);
drawerOverlayEl.addEventListener('click', closeMenu);

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    closeMenu();
    renderList();
  });
});

// Controles do Modal de Importação em Lote
function openImportModal() {
  closeMenu();
  importModalEl.classList.remove('hidden');
  bulkTextareaEl.focus();
}

function closeImportModal() {
  importModalEl.classList.add('hidden');
  bulkTextareaEl.value = '';
}

importBtn.addEventListener('click', openImportModal);
openImportMenuBtn.addEventListener('click', openImportModal);
cancelImportBtn.addEventListener('click', closeImportModal);

confirmImportBtn.addEventListener('click', () => {
  const lines = bulkTextareaEl.value.split('\n');
  let added = false;

  lines.reverse().forEach((line, index) => {
    const cleanName = line.replace(/^[-*•\d.)\s]+/, '').trim(); // Remove marcadores de lista
    if (cleanName) {
      items.unshift({
        id: Date.now() + index,
        name: cleanName,
        bought: false
      });
      added = true;
    }
  });

  if (added) {
    currentTab = 'to-buy';
    navItems.forEach(b => b.classList.toggle('active', b.dataset.tab === 'to-buy'));
    saveItems();
    renderList();
  }
  closeImportModal();
});

// Evita problemas com caracteres especiais
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Inicializa o app
renderList();