import { apiFetch } from "./utils/api.js";  
import { getToken } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const salesHistory = document.getElementById("salesHistory");
    const searchInput = document.getElementById("searchInput");
    const dateInput = document.getElementById("dateFilter");
    const totalDebtElement = document.getElementById("totalDebt");
    let sales = [];

    try {
        const token = getToken();
        sales = await apiFetch("/sales", "GET", null, token);

        const unsettledSales = sales.filter(sale => !sale.settled);
        
        displaySales(unsettledSales);
        updateTotalDebt(unsettledSales);

        // Filtro por nombre
        searchInput.addEventListener("input", () => {
            const searchText = searchInput.value.toLowerCase().trim();
            const filtered = filterSales(unsettledSales, searchText, dateInput.value);
            displaySales(filtered);
            updateTotalDebt(filtered);
        });

        // Filtro por fecha
        dateInput.addEventListener("change", () => {
            const searchText = searchInput.value.toLowerCase().trim();
            const filtered = filterSales(unsettledSales, searchText, dateInput.value);
            displaySales(filtered);
            updateTotalDebt(filtered);
        });

    } catch (error) {
        console.error("Error al cargar el historial de ventas:", error);
        salesHistory.innerHTML = "<p>No se pudieron cargar las ventas, vuelva a intentarlo.</p>";
    }
});

function filterSales(salesList, searchText, dateFilter) {
    return salesList.filter(sale => {
        const matchesName = sale.clientName.toLowerCase().includes(searchText);
        const matchesDate = dateFilter
            ? new Date(sale.saleDate).toISOString().split("T")[0] === dateFilter
            : true;
        return matchesName && matchesDate;
    });
}

function displaySales(salesList) {
    const salesHistory = document.getElementById("salesHistory");
    salesHistory.innerHTML = "";

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
            <span>${sale.clientName} - ${sale.productName} - ${remainingDebt.toLocaleString()} COP</span>
            <div class="buttons-container">
                <button class="info btn">Info</button>
                <button class="edit btn">volver</button>
                <button class="delete btn">Eliminar</button>
                <button class="settle btn">Liquidar</button>
            </div>
        `;

        li.querySelector(".info").addEventListener("click", () => viewSaleDetails(sale));
        li.querySelector(".edit").addEventListener("click", () => editSale(sale));
        li.querySelector(".delete").addEventListener("click", () => deleteSale(sale._id, li));
        li.querySelector(".settle").addEventListener("click", () => settleSale(sale._id, li));

        salesHistory.appendChild(li);
    });
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
        location.reload();
    } catch (error) {
        console.error("Error al eliminar la venta:", error);
        alert("No se pudo eliminar la venta, vuelva a intentarlo.");
    }
}

async function settleSale(id, listItem) {
    if (!confirm("¿Estás seguro de que deseas liquidar esta venta?")) return;

    try {
        const token = getToken();
        await apiFetch(`/sales/${id}/settle`, "PATCH", null, token);
        listItem.remove();
        alert("Venta liquidada correctamente.");
        location.reload();
    } catch (error) {
        console.error("Error al liquidar la venta:", error);
        alert("No se pudo liquidar la venta, vuelva a intentarlo.");
    }
}

function editSale(sale) {
    window.location.href = "categories.html";
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
