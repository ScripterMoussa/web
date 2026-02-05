const PRODUCTS_URL = 'products.json';
const CART_KEY = 'clublocker_cart';

async function fetchProducts(){
  const res = await fetch(PRODUCTS_URL);
  return res.json();
}

function formatCurrency(n){
  return `$${n.toFixed(2)}`;
}

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  const el = document.getElementById('cart-count');
  if(el) el.textContent = count;
}

function addToCart(productId, qty=1){
  const cart = getCart();
  const idx = cart.findIndex(i=>i.id===productId);
  if(idx>-1) cart[idx].qty += qty;
  else cart.push({id:productId,qty});
  saveCart(cart);
  alert('Added to cart');
}

function renderProductCard(p){
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <h3>${p.name}</h3>
    <div class="muted">${p.brand || ''}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
      <div class="price">${formatCurrency(p.price)}</div>
      <div class="actions">
        <a class="btn" href="product.html?id=${p.id}">View</a>
        <button class="btn primary" onclick="addToCart('${p.id}',1)">Add</button>
      </div>
    </div>
  `;
  return div;
}

async function initHomepage(){
  updateCartCount();
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  const products = await fetchProducts();
  products.forEach(p=>grid.appendChild(renderProductCard(p)));
}

async function renderProductDetails(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return;
  const products = await fetchProducts();
  const p = products.find(x=>String(x.id)===String(id));
  if(!p) return;
  document.getElementById('prod-name').textContent = p.name;
  document.getElementById('prod-brand').textContent = p.brand || '';
  document.getElementById('prod-img').src = p.image;
  document.getElementById('prod-price').textContent = formatCurrency(p.price);
  document.getElementById('add-btn').addEventListener('click',()=>addToCart(p.id,1));
}

async function renderCartPage(){
  const container = document.getElementById('cart-items');
  if(!container) return;
  const products = await fetchProducts();
  const cart = getCart();
  container.innerHTML = '';
  if(cart.length===0){ container.innerHTML = '<p>Your cart is empty.</p>'; return }
  let total = 0;
  cart.forEach(item=>{
    const p = products.find(x=>String(x.id)===String(item.id));
    if(!p) return;
    const row = document.createElement('div');
    row.className = 'card';
    row.style.flexDirection = 'row';
    row.style.alignItems = 'center';
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" style="width:90px;height:60px;object-fit:cover;margin-right:12px">
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <div class="muted">${p.brand || ''}</div>
      </div>
      <div style="text-align:right">
        <div>${formatCurrency(p.price)}</div>
        <div>Qty: ${item.qty}</div>
      </div>
    `;
    container.appendChild(row);
    total += p.price*item.qty;
  });
  const summary = document.createElement('div');
  summary.style.marginTop = '12px';
  summary.innerHTML = `<div style="font-weight:700">Total: ${formatCurrency(total)}</div><div style="margin-top:8px"><button class="btn primary" id="checkout">Checkout</button> <button class="btn" id="clear-cart">Clear</button></div>`;
  container.appendChild(summary);
  document.getElementById('clear-cart').addEventListener('click',()=>{localStorage.removeItem(CART_KEY);renderCartPage();updateCartCount()});
  document.getElementById('checkout').addEventListener('click',()=>{alert('Demo checkout — implement real checkout integration');});
}

// Auto init depending on page
document.addEventListener('DOMContentLoaded',()=>{
  initHomepage();
  if(document.getElementById('prod-name')) renderProductDetails();
  if(document.getElementById('cart-items')) renderCartPage();
});
