import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

let sales = [];

document.addEventListener("DOMContentLoaded", async () => {
    const liquidatedHistory = document.getElementById("liquidatedHistory");
    const searchInput = document.getElementById("searchInput");
    const totalLiquidatedElement = document.getElementById("totalLiquidated");


    try {
        const token = getToken();
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
                    liquidatedHistory.innerHTML = "<p>No existe esa venta liquidada.</p>";
                    updateTotalLiquidated([]);
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar las ventas liquidadas:", error);
        liquidatedHistory.innerHTML = "<p>No se pudieron cargar las ventas liquidadas, vuelva a intentarlo.</p>";
    }
});

function displayLiquidatedSales(salesList) {
    const liquidatedHistory = document.getElementById("liquidatedHistory");
    liquidatedHistory.innerHTML = ""; // Limpiar antes de actualizar

    if (salesList.length === 0) {
        liquidatedHistory.innerHTML = "<p>No hay ventas liquidadas para mostrar.</p>";
        return;
    }

    salesList.forEach((sale) => {
        const li = document.createElement("li");
        li.classList.add("sale-item");

        // Formatear fecha
        const settledDate = new Date(sale.settledDate).toLocaleDateString();
        const saleDate = new Date(sale.saleDate).toLocaleDateString();

        li.innerHTML = `
            <div class="sale-info">
                <h3>${sale.clientName}</h3>
                <p><strong>Producto:</strong> ${sale.productName}</p>
                <p><strong>Precio:</strong> ${sale.price.toLocaleString()} COP</p>
                <p><strong>Fecha de venta:</strong> ${saleDate}</p>
                <p><strong>Liquidado el:</strong> ${settledDate}</p>
                <button class="delete-btn" data-id="${sale._id}">Eliminar</button> <!-- Botón de eliminar -->
            </div>
        `;

        liquidatedHistory.appendChild(li);
    });

    updateTotalLiquidated(salesList);

    // Agregar evento al botón de eliminar
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach(button => {
        button.addEventListener("click", async (e) => {
            const saleId = e.target.dataset.id;
            try {
                const token = getToken();
                await apiFetch(`/sales/${saleId}`, "DELETE", null, token); // Eliminar la venta del backend

                // Filtrar la venta eliminada y actualizar la vista
                sales = sales.filter(sale => sale._id !== saleId);
                displayLiquidatedSales(sales);
                updateTotalLiquidated(sales);
                alert("Venta eliminada correctamente.");
            } catch (error) {
                console.error("Error al eliminar la venta:", error);
                alert("No se pudo eliminar la venta.");
            }
        });
    });
}

function updateTotalLiquidated(salesList) {
    const totalLiquidatedElement = document.getElementById("totalLiquidated");

    const totalLiquidated = salesList.reduce((sum, sale) => sum + sale.price, 0);

    totalLiquidatedElement.textContent = `${totalLiquidated.toLocaleString()} COP`;
}
