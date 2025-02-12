let cart = JSON.parse(localStorage.getItem("cart")) || [];
let stock = JSON.parse(localStorage.getItem("stock")) || {
  "Helado de Vainilla": 10,
  "Helado de Chocolate": 8,
  "Helado de Frutilla": 15,
};

function addToCart(item) {
  if (stock[item] > 0) {
    const existingItem = cart.find((cartItem) => cartItem.name === item);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name: item, quantity: 1 });
    }
    stock[item]--;
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("stock", JSON.stringify(stock));
    renderCart();
  } else {
    alert(`No hay suficiente stock de ${item}`);
  }
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - Cantidad: ${item.quantity}`;
    cartItems.appendChild(li);
  });
}

function checkout() {
  alert("Pedido finalizado");
  localStorage.removeItem("cart");
  cart = [];
  renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  localStorage.setItem("stock", JSON.stringify(stock)); // Inicializa el stock en localStorage si no existe
});
