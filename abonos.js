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

        // Cargar todas las ventas (liquidadas y no liquidadas)
        allSales = await apiFetch("/sales/all", "GET", null, token);
        
        // Extraer todos los pagos de todas las ventas
        allPayments = extractAllPayments(allSales);
        
        displayPayments(allPayments);
        updateTotalPayments(allPayments);

        // Eventos para filtros
        searchInput.addEventListener("input", applyFilters);
        dateFilter.addEventListener("change", applyFilters);
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
        
        // Ordenar por fecha más reciente primero
        return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function displayPayments(payments) {
        paymentsList.innerHTML = "";
        
        if (payments.length === 0) {
            paymentsList.innerHTML = "<p>No hay abonos para mostrar.</p>";
            return;
        }

        payments.forEach(payment => {
            const li = document.createElement("li");
            li.classList.add("payment-item");
            
            // Formatear fecha
            const paymentDate = new Date(payment.date).toLocaleDateString();
            
            li.innerHTML = `
                <div class="payment-info">
                    <h3>${payment.clientName}</h3>
                    <p><strong>Producto:</strong> ${payment.productName}</p>
                    <p><strong>Monto abonado:</strong> ${payment.amount.toLocaleString()} COP</p>
                    <p><strong>Fecha:</strong> ${paymentDate}</p>
                </div>

                

            `;
            
            paymentsList.appendChild(li);
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
        
        // Filtrar por texto de búsqueda
        if (searchText) {
            filteredPayments = filteredPayments.filter(payment => 
                payment.clientName.toLowerCase().includes(searchText) ||
                payment.productName.toLowerCase().includes(searchText)
            );
        }
        
        // Filtrar por fecha
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