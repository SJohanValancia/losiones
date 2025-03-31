import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const productsList = document.getElementById("productsList");
    const searchInput = document.getElementById("searchInput");
    const totalSoldElement = document.getElementById("totalSold");
    const totalProductsElement = document.getElementById("totalProducts");
    const totalProfitElement = document.getElementById("totalProfit");
    
    let soldProducts = [];

    try {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const products = await apiFetch("/products", "GET", null, token);

        // Filtrar solo productos vendidos
        soldProducts = products.filter(product => product.sold);

        displayProducts(soldProducts);
        updateTotals(soldProducts);

        // Filtrar los productos mientras se escribe en el campo de búsqueda
        searchInput.addEventListener("input", () => {
            const searchText = searchInput.value.toLowerCase().trim();

            if (searchText === "") {
                displayProducts(soldProducts);
                updateTotals(soldProducts);
            } else {
                const filteredProducts = soldProducts.filter(product => 
                    product.name.toLowerCase().includes(searchText)
                );

                if (filteredProducts.length > 0) {
                    displayProducts(filteredProducts);
                    updateTotals(filteredProducts);
                } else {
                    productsList.innerHTML = "<p>No existe ese producto vendido.</p>";
                    updateTotals([]);
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar productos vendidos:", error);
        alert("No se pudieron cargar los productos vendidos.");
    }
});

function displayProducts(products) {
    const productsList = document.getElementById("productsList");
    productsList.innerHTML = "";
    
    if (products.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No hay productos vendidos para mostrar";
        emptyMessage.classList.add("empty-message");
        productsList.appendChild(emptyMessage);
        return;
    }

    products.forEach(product => {
        const li = document.createElement("li");
        const profit = product.salePrice - product.costPrice;
        const profitPercentage = Math.round((profit / product.costPrice) * 100);
        
        li.innerHTML = `
            <div class="product-info">
                <h3>${product.name}</h3>
                <p><strong>Precio de costo:</strong> ${product.costPrice.toLocaleString()} COP</p>
                <p><strong>Precio de venta:</strong> ${product.salePrice.toLocaleString()} COP</p>
                <p><strong>Ganancia:</strong> ${profit.toLocaleString()} COP (${profitPercentage}%)</p>
            </div>
        `;
        
        productsList.appendChild(li);
    });
}

function updateTotals(products) {
    const totalSoldElement = document.getElementById("totalSold");
    const totalProductsElement = document.getElementById("totalProducts");
    const totalProfitElement = document.getElementById("totalProfit");
    
    const totalSold = products.reduce((sum, product) => sum + product.salePrice, 0);
    const totalProfit = products.reduce((sum, product) => sum + (product.salePrice - product.costPrice), 0);
    
    totalProductsElement.textContent = products.length;
    totalSoldElement.textContent = `${totalSold.toLocaleString()} COP`;
    totalProfitElement.textContent = `${totalProfit.toLocaleString()} COP`;
}