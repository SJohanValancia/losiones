import { apiFetch } from "../utils/api.js";
import { getToken } from "../utils/auth.js";

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

async function loadSales() {
  try {
      const token = getToken();
      const sales = await apiFetch("/sales", "GET", null, token);
      list.innerHTML = "";
      sales.forEach((sale) => {
          const totalPaid = sale.totalPaid || sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
          const remainingDebt = sale.price - totalPaid;
          const li = document.createElement("li");
          li.innerHTML = `
              <span>${sale.clientName} - ${sale.productName} -  ${remainingDebt} COP</span>
              <div class="buttons-container">
                  <button id="info" class="info btn">Info</button>
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
      alert("No se pudieron cargar las ventas");
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
    
    // Mostrar los elementos para agregar un pago
    document.getElementById("paymentSection").style.display = "block";
    inputPaymentDate.value = new Date().toISOString().split('T')[0];

    btnSave.style.display = "none";
    btnUpdate.style.display = "inline-block";
    btnCancel.style.display = "inline-block";
    btnDelete.style.display = "inline-block";
    btnAddPayment.style.display = "inline-block";
}

btnDelete.addEventListener("click", async () => {
    const id = inputId.value;
    if (!id) {
        alert("No se ha seleccionado ninguna venta.");
        return;
    }
    await deleteSale(id);
    cancelUpdate();
});

async function saveSale() {
    const saleData = {
        clientName: inputClient.value.trim(),
        productName: inputProduct.value.trim(),
        saleDate: inputDate.value,
        price: parseFloat(inputPrice.value),
        installments: parseInt(inputInstallments.value),
        advancePayment: parseFloat(inputAdvance.value) || 0
    };
    
    if (Object.values(saleData).some(value => value === "" || value === null || value === undefined)) {
      alert("Completa todos los campos.");
      return;
    }
  
    try {
        const token = getToken();
        await apiFetch("/sales/new", "POST", saleData, token);
        alert("Venta guardada correctamente.");
        form.reset();
        loadSales();
    } catch (error) {
        console.error("Error al guardar la venta:", error.message);
        alert("No se pudo guardar la venta.");
    }
}

async function updateSale() {
    const id = inputId.value;
    const saleData = {
        clientName: inputClient.value.trim(),
        productName: inputProduct.value.trim(),
        saleDate: inputDate.value,
        price: parseFloat(inputPrice.value),
        installments: parseInt(inputInstallments.value)
    };
    
    if (!id || Object.values(saleData).some(value => !value)) {
        alert("Completa todos los campos.");
        return;
    }
    
    try {
        const token = getToken();
        await apiFetch(`/sales/${id}`, "PUT", saleData, token);
        alert("Venta actualizada correctamente.");
        cancelUpdate();
        loadSales();
    } catch (error) {
        console.error("Error al actualizar la venta:", error.message);
        alert("No se pudo actualizar la venta.");
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
        await apiFetch(`/sales/${id}/payment`, "POST", paymentData, token);
        alert("Abono registrado correctamente.");
        loadSales();
    } catch (error) {
        console.error("Error al registrar el abono:", error.message);
        alert("No se pudo registrar el abono.");
    }
}

function cancelUpdate() {
    btnSave.style.display = "inline-block";
    btnUpdate.style.display = "none";
    btnCancel.style.display = "none";
    btnDelete.style.display = "none";
    btnAddPayment.style.display = "none";
    document.getElementById("paymentSection").style.display = "none";
    form.reset();
}

btnSave.addEventListener("click", saveSale);
btnUpdate.addEventListener("click", updateSale);
btnCancel.addEventListener("click", cancelUpdate);
btnAddPayment.addEventListener("click", addPayment);

document.addEventListener("DOMContentLoaded", () => {
    loadSales();
    // Ocultar la sección de pagos al inicio
    document.getElementById("paymentSection") && (document.getElementById("paymentSection").style.display = "none");
});