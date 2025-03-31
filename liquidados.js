import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

const searchInput = document.getElementById("searchInput");
const settledSalesList = document.getElementById("settledSalesList");
const totalSettledSpan = document.getElementById("totalSettled");

let allSettledSales = [];

async function loadSettledSales() {
    try {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }
        
        const sales = await apiFetch("/sales/settled", "GET", null, token);
        allSettledSales = sales;
        displaySettledSales(sales);
        calculateTotalSettled(sales);
    } catch (error) {
        console.error("Error al cargar ventas liquidadas:", error);
        alert("No se pudieron cargar las ventas liquidadas. Por favor, inicia sesión nuevamente.");
    }
}

function displaySettledSales(sales) {
    settledSalesList.innerHTML = "";
    
    if (sales.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No hay ventas liquidadas para mostrar";
        emptyMessage.classList.add("empty-message");
        settledSalesList.appendChild(emptyMessage);
        return;
    }

    sales.forEach(sale => {
        const li = document.createElement("li");
        
        // Formatear la fecha de liquidación
        const settledDate = new Date(sale.settledDate).toLocaleDateString();
        
        li.innerHTML = `
            <div class="sale-info">
                <h3>${sale.clientName}</h3>
                <p><strong>Producto:</strong> ${sale.productName}</p>
                <p><strong>Precio:</strong> ${sale.price} COP</p>
                <p><strong>Fecha de venta:</strong> ${new Date(sale.saleDate).toLocaleDateString()}</p>
                <p><strong>Liquidado el:</strong> ${settledDate}</p>
            </div>
        `;
        
        settledSalesList.appendChild(li);
    });
}

function calculateTotalSettled(sales) {
    const total = sales.reduce((sum, sale) => sum + sale.price, 0);
    totalSettledSpan.textContent = total.toLocaleString() + " COP";
}

function filterSales() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displaySettledSales(allSettledSales);
        calculateTotalSettled(allSettledSales);
        return;
    }
    
    const filteredSales = allSettledSales.filter(sale => 
        sale.clientName.toLowerCase().includes(searchTerm)
    );
    
    displaySettledSales(filteredSales);
    calculateTotalSettled(filteredSales);
}

// Event Listeners
searchInput.addEventListener("input", filterSales);

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", loadSettledSales);