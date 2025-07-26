import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

let sales = [];

document.addEventListener("DOMContentLoaded", async () => {
    const liquidatedHistory = document.getElementById("liquidatedHistory");
    const searchInput = document.getElementById("searchInput");
    const totalLiquidatedElement = document.getElementById("totalLiquidated");

    try {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }
        
        sales = await apiFetch("/sales/settled", "GET", null, token);
        
        displayLiquidatedSales(sales);
        updateTotalLiquidated(sales);

        // Filtrar las ventas mientras se escribe en el campo de búsqueda
        searchInput.addEventListener("input", () => {
            const searchText = searchInput.value.toLowerCase().trim();

            if (searchText === "") {
                displayLiquidatedSales(sales);
                updateTotalLiquidated(sales);
            } else {
                const filteredSales = sales.filter(sale => 
                    sale.clientName.toLowerCase().includes(searchText)
                );

                if (filteredSales.length > 0) {
                    displayLiquidatedSales(filteredSales);
                    updateTotalLiquidated(filteredSales);
                } else {
                    liquidatedHistory.innerHTML = `
                        <li class="empty-message">
                            <div class="empty-icon">🔍</div>
                            <p>No se encontraron ventas liquidadas para ese cliente.</p>
                        </li>`;
                    updateTotalLiquidated([]);
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar las ventas liquidadas:", error);
        liquidatedHistory.innerHTML = `
            <li class="error-message">
                <div class="error-icon">❌</div>
                <p>No se pudieron cargar las ventas liquidadas. Intenta nuevamente.</p>
            </li>`;
    }
});

function displayLiquidatedSales(salesList) {
    const liquidatedHistory = document.getElementById("liquidatedHistory");
    liquidatedHistory.innerHTML = ""; // Limpiar antes de actualizar

    if (salesList.length === 0) {
        liquidatedHistory.innerHTML = `
            <li class="empty-message">
                <div class="empty-icon">📃</div>
                <p>No hay ventas liquidadas para mostrar.</p>
            </li>`;
        return;
    }

    salesList.forEach((sale) => {
        const li = document.createElement("li");
        li.classList.add("sale-item");

        // Formatear fechas
        const settledDate = new Date(sale.settledDate).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const saleDate = new Date(sale.saleDate).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Calcular días entre venta y liquidación
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysBetween = Math.round(
            (new Date(sale.settledDate) - new Date(sale.saleDate)) / msPerDay
        );

        li.innerHTML = `
            <div class="sale-header">
                <div class="client-info">
                    <h3>${sale.clientName}</h3>
                    <span class="status-badge">Liquidado</span>
                </div>
                <div class="product-name">${sale.productName}</div>
            </div>
            
            <div class="sale-details">
                <div class="detail-row">
                    <div class="detail-group">
                        <span class="detail-label">Precio:</span>
                        <span class="detail-value price">${sale.price.toLocaleString()} COP</span>
                    </div>
                </div>
                
                <div class="dates-container">
                    <div class="date-group">
                        <div class="date-icon">📅</div>
                        <div class="date-info">
                            <span class="date-label">Fecha de venta:</span>
                            <span class="date-value">${saleDate}</span>
                        </div>
                    </div>
                    
                    <div class="date-arrow">↓ ${daysBetween} días</div>
                    
                    <div class="date-group settled">
                        <div class="date-icon">✅</div>
                        <div class="date-info">
                            <span class="date-label">Liquidado el:</span>
                            <span class="date-value">${settledDate}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card-actions">
                <button class="delete-btn" data-id="${sale._id}">
                    <span class="btn-icon">🗑️</span> Eliminar registro
                </button>
            </div>
        `;

        liquidatedHistory.appendChild(li);
    });

    // Agregar evento al botón de eliminar
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            if (confirm("¿Estás seguro de que deseas eliminar este registro de liquidación?")) {
                const saleId = e.target.closest(".delete-btn").dataset.id;
                try {
                    const token = getToken();
                    await apiFetch(`/sales/${saleId}`, "DELETE", null, token);
                    
                    // Animación de eliminación
                    const card = e.target.closest("li");
                    card.classList.add("deleting");
                    
                    setTimeout(() => {
                        // Eliminar la venta del array y actualizar la vista
                        sales = sales.filter(sale => sale._id !== saleId);
                        
                        if (sales.length === 0) {
                            liquidatedHistory.innerHTML = `
                                <li class="empty-message">
                                    <div class="empty-icon">📃</div>
                                    <p>No hay ventas liquidadas para mostrar.</p>
                                </li>`;
                        } else {
                            card.remove();
                        }
                        
                        updateTotalLiquidated(sales);
                    }, 300);
                    
                } catch (error) {
                    console.error("Error al eliminar la venta:", error);
                    alert("No se pudo eliminar la venta.");
                }
            }
        });
    });
}

function updateTotalLiquidated(salesList) {
    const totalLiquidatedElement = document.getElementById("totalLiquidated");
    const totalLiquidated = salesList.reduce((sum, sale) => sum + sale.price, 0);
    totalLiquidatedElement.textContent = `${totalLiquidated.toLocaleString()} COP`;
}

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
