import { apiFetch } from "./utils/api.js";  
import { getToken } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const salesHistory = document.getElementById("salesHistory");
    const searchInput = document.getElementById("searchInput");
    let sales = [];

    try {
        const token = getToken();
        sales = await apiFetch("/sales", "GET", null, token);

        displaySales(sales);

        // Filtrar las ventas mientras se escribe en el campo de búsqueda
        searchInput.addEventListener("input", () => {
            const searchText = searchInput.value.toLowerCase().trim();

            if (searchText === "") {
                displaySales(sales); // Mostrar todas si el input está vacío
            } else {
                const filteredSales = sales.filter(sale => 
                    sale.clientName.toLowerCase().includes(searchText)
                );

                if (filteredSales.length > 0) {
                    displaySales(filteredSales);
                } else {
                    salesHistory.innerHTML = "<p>No existe esa venta.</p>";
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
        listItem.remove(); // Eliminar de la lista sin recargar
        alert("Venta eliminada correctamente.");
    } catch (error) {
        console.error("Error al eliminar la venta:", error);
        alert("No se pudo eliminar la venta, vuelvalo a intentar.");
    }
}

function editSale(sale) {
    window.location.href = "categories.html";
}
