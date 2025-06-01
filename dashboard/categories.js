import { apiFetch } from "../utils/api.js";
import { getToken } from "../utils/auth.js";
import "./keepAlive.js";

// Referencias a elementos del DOM
const form = document.getElementById("salesForm");
const inputId = document.getElementById("saleId");
const inputClient = document.getElementById("clientName");
const inputProduct = document.getElementById("productName");
const inputDate = document.getElementById("saleDate");
const inputPrice = document.getElementById("price");
const inputInstallments = document.getElementById("installments");
const inputAdvance = document.getElementById("advancePayment");
const inputPaymentDate = document.getElementById("paymentDate");

const btnSave = document.getElementById("saveSale");
const btnUpdate = document.getElementById("updateSale");
const btnCancel = document.getElementById("cancelUpdate");
const btnDelete = document.getElementById("deleteSale");
const btnAddPayment = document.getElementById("addPayment");
const list = document.getElementById("salesList");
const searchInput = document.getElementById("searchInput");  // Campo de búsqueda

async function loadSales(query = "") {
    try {
        const token = getToken();
        const sales = await apiFetch("/sales", "GET", null, token);
        list.innerHTML = "";

        // Si hay un query de búsqueda, filtrar las ventas que coincidan con el nombre
        const filteredSales = sales.filter(sale => {
            
            const clientMatch = sale.clientName.toLowerCase().includes(query.toLowerCase());
            const productMatch = sale.productName.toLowerCase().includes(query.toLowerCase());
            return clientMatch || productMatch;
        });

        if (filteredSales.length === 0) {
            list.innerHTML = `<li class="empty-list">No hay ventas que coincidan con la búsqueda.</li>`;
            return;
        }

        filteredSales.forEach((sale) => {
            const totalPaid = sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
            const remainingDebt = sale.price - totalPaid;
            const paymentPercentage = (totalPaid / sale.price) * 100;
            
            const li = document.createElement("li");
            li.setAttribute("data-sale-id", sale._id); // <-- MUY importante
            li.innerHTML = `
                <span>${sale.clientName} - ${sale.productName} - $${remainingDebt.toLocaleString('es-CO')} (${paymentPercentage.toFixed(0)}%)</span>
                <div class="buttons-container">
                    <button class="info btn">Info</button>
                    <button class="edit btn">Editar</button>
                    <button class="delete btn">Eliminar</button>
                </div>
            `;

            li.querySelector(".info").addEventListener("click", () => viewSaleDetails(sale));
            li.querySelector(".edit").addEventListener("click", () => editSale(sale));
            li.querySelector(".delete").addEventListener("click", () => deleteSale(sale._id));
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar ventas:", error);
        list.innerHTML = `<li class="empty-list">No se pudieron cargar las ventas. Error: ${error.message}</li>`;
    }
}

function viewSaleDetails(sale) {
    localStorage.setItem("saleDetails", JSON.stringify(sale));
    window.location.href = "saleDetails.html";
}

async function deleteSale(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta venta?")) {
        return;
    }
    try {
        const token = getToken();
        await apiFetch(`/sales/${id}`, "DELETE", null, token);
        alert("Venta eliminada correctamente.");
        loadSales();
    } catch (error) {
        console.error("Error al eliminar la venta:", error.message);
        alert("No se pudo eliminar la venta.");
    }
}

function editSale(sale) {
    inputId.value = sale._id;
    inputClient.value = sale.clientName;
    inputProduct.value = sale.productName;
    inputDate.value = new Date(sale.saleDate).toISOString().split('T')[0];
    inputPrice.value = sale.price;
    inputInstallments.value = sale.installments;
    
    // Si hay un campo para la dirección, también lo rellenamos
    if (document.getElementById("clientAddress")) {
        document.getElementById("clientAddress").value = sale.clientAddress || '';
    }

    // Mostrar los elementos para agregar un pago
    document.getElementById("paymentSection").style.display = "block";
    inputPaymentDate.value = new Date().toISOString().split('T')[0];

    btnSave.style.display = "none";
    btnUpdate.style.display = "inline-block";
    btnCancel.style.display = "inline-block";
    btnDelete.style.display = "none"; // Ocultamos el botón de eliminar
    btnAddPayment.style.display = "inline-block";
}

async function saveSale() {
    const saleData = {
        clientName: inputClient.value.trim(),
        clientAddress: document.getElementById("clientAddress").value.trim(), // Dirección del cliente
        productName: inputProduct.value.trim(),
        saleDate: inputDate.value,
        price: parseFloat(inputPrice.value),
        installments: inputInstallments.value.trim(),
        advancePayment: parseFloat(inputAdvance.value) || 0
    };

    try {
        const token = getToken();
        await apiFetch("/sales/new", "POST", saleData, token);
        alert("Venta guardada correctamente.");
        form.reset();
        loadSales();
    } catch (error) {
        console.error("Error al guardar la venta:", error.message);
        alert("No se pudo guardar la venta: " + error.message);
    }
}

async function updateSale() {
    const id = inputId.value;

    const saleData = {
        clientName: inputClient.value.trim(),
        clientAddress: document.getElementById("clientAddress").value.trim(), // Dirección del cliente
        productName: inputProduct.value.trim(),
        saleDate: inputDate.value,
        price: parseFloat(inputPrice.value),
        installments: inputInstallments.value.trim()
    };

    try {
        const token = getToken();
        await apiFetch(`/sales/${id}`, "PUT", saleData, token);
        alert("Venta actualizada correctamente.");
        cancelUpdate();
        loadSales();
    } catch (error) {
        console.error("Error al actualizar la venta:", error.message);
        alert("No se pudo actualizar la venta: " + error.message);
    }
}

async function addPayment() {
    const id = inputId.value;
    if (!id) {
        alert("No se ha seleccionado ninguna venta.");
        return;
    }

    const paymentData = {
        amount: parseFloat(inputAdvance.value),
        date: inputPaymentDate.value
    };

    if (!paymentData.amount || paymentData.amount <= 0) {
        alert("El monto del abono debe ser mayor a cero.");
        return;
    }

    try {
        const token = getToken();
        const response = await apiFetch(`/sales/${id}/payment`, "POST", paymentData, token);

        console.log("Respuesta del servidor:", response);

        const formattedAmount = paymentData.amount.toLocaleString('es-CO');
        alert(`Abono de $${formattedAmount} registrado correctamente.`);

        if (response.justSettled || response.settled) {
            alert("¡Venta liquidada automáticamente!");

            // Eliminar del DOM esta venta
            const saleItem = document.querySelector(`[data-sale-id="${id}"]`);
            if (saleItem) {
                saleItem.remove();
            }

            if (confirm("¿Deseas ir a la sección de ventas liquidadas?")) {
                window.location.href = "liquidados.html";
                return;
            }
        }

        cancelUpdate();
        loadSales();
    } catch (error) {
        console.error("Error al registrar el abono:", error.message);
        alert("No se pudo registrar el abono: " + error.message);
    }
}



function cancelUpdate() {
    btnSave.style.display = "inline-block";
    btnUpdate.style.display = "none";
    btnCancel.style.display = "none";
    btnDelete.style.display = "none"; // Siempre oculto
    btnAddPayment.style.display = "none";
    document.getElementById("paymentSection").style.display = "none";
    form.reset();
}

// Event listener para el campo de búsqueda
searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim(); // Obtener la búsqueda del usuario
    loadSales(query); // Recargar las ventas filtradas
});

// Event listeners
btnSave.addEventListener("click", saveSale);
btnUpdate.addEventListener("click", updateSale);
btnCancel.addEventListener("click", cancelUpdate);
btnAddPayment.addEventListener("click", addPayment);

// Inicialización cuando se carga el DOM
document.addEventListener("DOMContentLoaded", () => {
    loadSales();
    if (document.getElementById("paymentSection")) {
        document.getElementById("paymentSection").style.display = "none";
    }
    
    // Configuración del menú desplegable
    const menuToggle = document.getElementById("menuToggle");
    const menuItems = document.getElementById("menuItems");
    const backdrop = document.getElementById("backdrop");
    
    if (menuToggle && menuItems && backdrop) {
        menuToggle.addEventListener("click", () => {
            menuItems.classList.toggle("show");
            backdrop.classList.toggle("show");
        });
        
        backdrop.addEventListener("click", () => {
            menuItems.classList.remove("show");
            backdrop.classList.remove("show");
        });
    }
});