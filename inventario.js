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
            window.location.href = "login.html";
            return;
        }
        
        const products = await apiFetch("/products", "GET", null, token);
        allProducts = products;
        displayProducts(products);
        updateTotalProducts(products);
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("No se pudieron cargar los productos. Por favor, inicia sesión nuevamente.");
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

        li.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <p><strong>Precio de costo:</strong> ${product.costPrice.toLocaleString()} COP</p>
                <p><strong>Precio de venta:</strong> ${product.salePrice.toLocaleString()} COP</p>
                <p><strong>Margen:</strong> ${(product.salePrice - product.costPrice).toLocaleString()} COP (${Math.round((product.salePrice - product.costPrice) / product.costPrice * 100)}%)</p>
            </div>
            <div class="buttons-container">
                <button class="edit btn">Editar</button>
                <button class="sell btn" ${product.sold ? "disabled" : ""}>Vendido</button>
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
                    alert("Producto marcado como vendido");
                    loadProducts(); // Recargar productos
                } catch (error) {
                    console.error("Error al marcar como vendido:", error);
                    alert("No se pudo marcar el producto como vendido.");
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