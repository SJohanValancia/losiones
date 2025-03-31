import { apiFetch } from "./utils/api.js";  
import { getToken } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const salesHistory = document.getElementById("salesHistory");
    const searchInput = document.getElementById("searchInput");
    const totalDebtElement = document.getElementById("totalDebt");
    let sales = [];

    try {
        const token = getToken();
        sales = await apiFetch("/sales", "GET", null, token);

        // Filter out settled sales
        const unsettledSales = sales.filter(sale => !sale.settled);
        
        displaySales(unsettledSales);
        updateTotalDebt(unsettledSales);

        // Filtrar las ventas mientras se escribe en el campo de búsqueda
        searchInput.addEventListener("input", () => {
            const searchText = searchInput.value.toLowerCase().trim();

            if (searchText === "") {
                displaySales(unsettledSales);
                updateTotalDebt(unsettledSales);
            } else {
                const filteredSales = unsettledSales.filter(sale => 
                    sale.clientName.toLowerCase().includes(searchText)
                );

                if (filteredSales.length > 0) {
                    displaySales(filteredSales);
                    updateTotalDebt(filteredSales);
                } else {
                    salesHistory.innerHTML = "<p>No existe esa venta.</p>";
                    updateTotalDebt([]);
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar el historial de ventas:", error);
        salesHistory.innerHTML = "<p>No se pudieron cargar las ventas, vuelvalo a intentar.</p>";
    }
});

function displaySales(salesList) {
    const salesHistory = document.getElementById("salesHistory");
    salesHistory.innerHTML = ""; // Limpiar antes de actualizar

    if (salesList.length === 0) {
        salesHistory.innerHTML = "<p>No hay ventas pendientes para mostrar.</p>";
        return;
    }

    salesList.forEach((sale) => {
        const totalPaid = sale.totalPaid || (sale.payments ? sale.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0);
        const remainingDebt = sale.price - totalPaid;

        const li = document.createElement("li");
        li.classList.add("sale-item");

        li.innerHTML = `
            <span>${sale.clientName} - ${sale.productName} - ${remainingDebt} COP</span>
            <div class="buttons-container">
                <button class="info btn">Info</button>
                <button class="edit btn">volver</button>
                <button class="delete btn">Eliminar</button>
            </div>
        `;

        li.querySelector(".info").addEventListener("click", () => viewSaleDetails(sale));
        li.querySelector(".edit").addEventListener("click", () => editSale(sale));
        li.querySelector(".delete").addEventListener("click", () => deleteSale(sale._id, li));

        salesHistory.appendChild(li);
    });

    updateTotalDebt(salesList); // Actualizar el total de deudas después de mostrar ventas
}

function updateTotalDebt(salesList) {
    const totalDebtElement = document.getElementById("totalDebt");

    const totalDebt = salesList.reduce((sum, sale) => {
        const totalPaid = sale.totalPaid || (sale.payments ? sale.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0);
        return sum + (sale.price - totalPaid);
    }, 0);

    totalDebtElement.textContent = `${totalDebt.toLocaleString()} COP`;
}

function viewSaleDetails(sale) {
    localStorage.setItem("saleDetails", JSON.stringify(sale));
    window.location.href = "saleDetails.html";
}

async function deleteSale(id, listItem) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta venta?")) return;

    try {
        const token = getToken();
        await apiFetch(`/sales/${id}`, "DELETE", null, token);
        listItem.remove();
        alert("Venta eliminada correctamente.");
        
        // Reload the sales data to update the total debt
        const sales = await apiFetch("/sales", "GET", null, token);
        const unsettledSales = sales.filter(sale => !sale.settled);
        updateTotalDebt(unsettledSales);
    } catch (error) {
        console.error("Error al eliminar la venta:", error);
        alert("No se pudo eliminar la venta, vuelva a intentarlo.");
    }
}

function editSale(sale) {
    window.location.href = "categories.html";
}