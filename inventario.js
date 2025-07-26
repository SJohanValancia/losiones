import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

const searchInput = document.getElementById("searchInput");
const productsList = document.getElementById("productsList");
const totalProductsSpan = document.getElementById("totalProducts");

let allProducts = [];

async function loadProducts() {
    try {
        const token = getToken();
        if (!token) {
            window.location.href = "index.html";
            return;
        }

        const products = await apiFetch("/products", "GET", null, token);

        // Filtrar solo productos NO vendidos para Inventario
        const availableProducts = products.filter(product => !product.sold);

        allProducts = availableProducts;
        displayProducts(availableProducts);
        updateTotalProducts(availableProducts);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productsList.innerHTML = `
            <li class="error-message">
                <div class="error-icon">❌</div>
                <p>No se pudieron cargar los productos. Intenta nuevamente.</p>
            </li>
        `;
    }
}

function displayProducts(products) {
    productsList.innerHTML = "";
    
    if (products.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No hay productos para mostrar";
        emptyMessage.classList.add("empty-message");
        productsList.appendChild(emptyMessage);
        return;
    }

    products.forEach(product => {
        const li = document.createElement("li");
        
        // Calcular la ganancia y el porcentaje de ganancia
        const profit = product.salePrice - product.costPrice;
        const profitPercentage = Math.round((profit / product.costPrice) * 100);

        li.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-details">
                    <div class="price-tag">
                        <span class="price-label">Precio de costo:</span>
                        <span class="price-value">${product.costPrice.toLocaleString()} COP</span>
                    </div>
                    <div class="price-tag">
                        <span class="price-label">Precio de venta:</span>
                        <span class="price-value">${product.salePrice.toLocaleString()} COP</span>
                    </div>
                    <div class="price-tag profit">
                        <span class="price-label">Ganancia estimada:</span>
                        <span class="price-value">${profit.toLocaleString()} COP (${profitPercentage}%)</span>
                    </div>
                </div>
            </div>
            <div class="buttons-container">
                <button class="edit btn">
                    <span class="btn-icon">✏️</span> Editar
                </button>
                <button class="sell btn" ${product.sold ? "disabled" : ""}>
                    <span class="btn-icon">✅</span> Marcar vendido
                </button>
            </div>
        `;

        li.querySelector(".edit").addEventListener("click", () => {
            window.location.href = "productos.html";
        });

        const sellButton = li.querySelector(".sell");
        if (!product.sold) {
            sellButton.addEventListener("click", async () => {
                try {
                    const token = getToken();
                    await apiFetch(`/products/${product._id}/sell`, "PUT", null, token);
                    sellButton.disabled = true;
                    sellButton.innerHTML = '<span class="btn-icon">✓</span> Vendido';
                    sellButton.classList.add("sold");
                    
                    // Recargar después de un breve retraso para mostrar la retroalimentación visual
                    setTimeout(() => {
                        loadProducts();
                    }, 800);
                } catch (error) {
                    console.error("Error al marcar como vendido:", error);
                    sellButton.innerHTML = '<span class="btn-icon">❌</span> No se pudo marcar';
                    sellButton.classList.add("error");
                    
                    // Restaurar el botón después de un momento
                    setTimeout(() => {
                        sellButton.innerHTML = '<span class="btn-icon">✅</span> Marcar vendido';
                        sellButton.classList.remove("error");
                    }, 2000);
                }
            });
        }

        productsList.appendChild(li);
    });
}

function updateTotalProducts(products) {
    totalProductsSpan.textContent = products.length;
}

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayProducts(allProducts);
        updateTotalProducts(allProducts);
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filteredProducts);
    updateTotalProducts(filteredProducts);
}

// Event Listeners
searchInput.addEventListener("input", filterProducts);

// Load data on page load
document.addEventListener("DOMContentLoaded", loadProducts);

const menuToggle = document.getElementById('menuToggle');
const menuItems = document.getElementById('menuItems');
const backdrop = document.getElementById('backdrop');

menuToggle.addEventListener('click', () => {
  menuItems.classList.toggle('show');
  backdrop.classList.toggle('show');
});

backdrop.addEventListener('click', () => {
  menuItems.classList.remove('show');
  backdrop.classList.remove('show');
});
