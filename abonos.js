import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const paymentsList = document.getElementById("paymentsList");
    const searchInput = document.getElementById("searchInput");
    const dateFilter = document.getElementById("dateFilter");
    const clearFiltersBtn = document.getElementById("clearFilters");
    const totalPaymentsElement = document.getElementById("totalPayments");
    
    let allSales = [];
    let allPayments = [];

    try {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        allSales = await apiFetch("/sales/all", "GET", null, token);
        allPayments = extractAllPayments(allSales);
        
        displayPayments(allPayments);
        updateTotalPayments(allPayments);

        searchInput.addEventListener("input", applyFilters);
        dateFilter.addEventListener("input", applyFilters);
        clearFiltersBtn.addEventListener("click", clearFilters);

    } catch (error) {
        console.error("Error al cargar registro de abonos:", error);
        paymentsList.innerHTML = "<p>No se pudieron cargar los abonos, vuelva a intentarlo.</p>";
    }

    function extractAllPayments(sales) {
        let payments = [];
        

    

        sales.forEach(sale => {
            if (sale.payments && sale.payments.length > 0) {
                sale.payments.forEach(payment => {
                    payments.push({
                        ...payment,
                        clientName: sale.clientName,
                        productName: sale.productName,
                        saleId: sale._id
                    });
                });
            }
        });
        return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function displayPayments(payments) {
        paymentsList.innerHTML = "";
    
        if (payments.length === 0) {
            paymentsList.innerHTML = "<p>No hay abonos para mostrar.</p>";
            return;
        }
    
        payments.forEach(payment => {
            const card = document.createElement("div");
            card.classList.add("payment-card");
    
            const paymentDate = new Date(payment.date).toLocaleDateString();
    
            card.innerHTML = `
                <div class="payment-info">
                    <h3>${payment.clientName}</h3>
                    <p><strong>Producto:</strong> ${payment.productName}</p>
                    <p><strong>Monto abonado:</strong> ${payment.amount.toLocaleString()} COP</p>
                    <p><strong>Fecha:</strong> ${paymentDate}</p>
                    <button class="delete-btn">Eliminar</button>
                </div>
            `;
    
            // Acción del botón eliminar
            card.querySelector(".delete-btn").addEventListener("click", async () => {
                const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este abono?");
                if (confirmDelete) {
                    try {
                        const token = getToken();
                        await apiFetch(`/sales/${payment.saleId}/payment/${payment._id}`, "DELETE", null, token);

                        allPayments = allPayments.filter(p => p._id !== payment._id);
                        displayPayments(allPayments);
                        updateTotalPayments(allPayments);
                    } catch (error) {
                        console.error("Error al eliminar abono:", error);
                        alert("No se pudo eliminar el abono.");
                    }
                }
            });
    
            paymentsList.appendChild(card);
        });
    }
    

    function updateTotalPayments(payments) {
        const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
        totalPaymentsElement.textContent = `${total.toLocaleString()} COP`;
    }

    function applyFilters() {
        const searchText = searchInput.value.toLowerCase().trim();
        const dateValue = dateFilter.value;
        
        let filteredPayments = [...allPayments];
        
        if (searchText) {
            filteredPayments = filteredPayments.filter(payment => 
                payment.clientName.toLowerCase().includes(searchText) ||
                payment.productName.toLowerCase().includes(searchText)
            );
        }
        
        if (dateValue) {
            const selectedDate = new Date(dateValue);
            selectedDate.setHours(0, 0, 0, 0);
            
            filteredPayments = filteredPayments.filter(payment => {
                const paymentDate = new Date(payment.date);
                paymentDate.setHours(0, 0, 0, 0);
                return paymentDate.getTime() === selectedDate.getTime();
            });
        }
        
        displayPayments(filteredPayments);
        updateTotalPayments(filteredPayments);
    }

    function clearFilters() {
        searchInput.value = "";
        dateFilter.value = "";
        displayPayments(allPayments);
        updateTotalPayments(allPayments);
    }
});
