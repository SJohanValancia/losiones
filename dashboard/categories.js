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

const btnSave = document.getElementById("saveSale");
const btnUpdate = document.getElementById("updateSale");
const btnCancel = document.getElementById("cancelUpdate");
const btnDelete = document.getElementById("deleteSale");
const list = document.getElementById("salesList");

async function loadSales() {
  try {
      const token = getToken();
      const sales = await apiFetch("/sales", "GET", null, token);
      list.innerHTML = "";
      sales.forEach((sale) => {
          const remainingDebt = sale.price - sale.advancePayment;
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
    inputDate.value = sale.saleDate;
    inputPrice.value = sale.price;
    inputInstallments.value = sale.installments;
    inputAdvance.value = sale.advancePayment;

    btnSave.style.display = "none";
    btnUpdate.style.display = "inline-block";
    btnCancel.style.display = "inline-block";
    btnDelete.style.display = "inline-block";
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
        advancePayment: parseFloat(inputAdvance.value)
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
        installments: parseInt(inputInstallments.value),
        advancePayment: parseFloat(inputAdvance.value)
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

function cancelUpdate() {
    btnSave.style.display = "inline-block";
    btnUpdate.style.display = "none";
    btnCancel.style.display = "none";
    btnDelete.style.display = "none";
    form.reset();
}

btnSave.addEventListener("click", saveSale);
btnUpdate.addEventListener("click", updateSale);
btnCancel.addEventListener("click", cancelUpdate);

document.addEventListener("DOMContentLoaded", loadSales);