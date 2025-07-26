import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";



document.addEventListener("DOMContentLoaded", async () => {
    const paymentsList = document.getElementById("paymentsList");
    const searchInput = document.getElementById("searchInput");
    const dateFilter = document.getElementById("dateFilter");
    const clearFiltersBtn = document.getElementById("clearFilters");
    const totalPaymentsElement = document.getElementById("totalPayments");
    const emptyState = document.getElementById("emptyState");

    
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
        
        if (allPayments.length === 0) {
            paymentsList.style.display = "none";
            emptyState.style.display = "block";
        } else {
            displayPayments(allPayments);
            updateTotalPayments(allPayments);
            emptyState.style.display = "none";
        }

        searchInput.addEventListener("input", applyFilters);
        dateFilter.addEventListener("input", applyFilters);
        clearFiltersBtn.addEventListener("click", clearFilters);

    } catch (error) {
        console.error("Error al cargar registro de abonos:", error);
        paymentsList.innerHTML = "<div class='empty-message'>No se pudieron cargar los abonos, vuelva a intentarlo.</div>";
    }

    function extractAllPayments(sales) {
        let payments = [];
        
        sales.forEach(sale => {
            if (sale.payments && sale.payments.length > 0) {
                sale.payments.forEach(payment => {
                    // Calcular el estado del crédito
                    const totalPaid = sale.payments.reduce((sum, p) => sum + p.amount, 0);
                    const remainingAmount = sale.price - totalPaid;
                    const progressPercentage = (totalPaid / sale.price) * 100;
                    const isCompleted = totalPaid >= sale.price;
                    
                    payments.push({
                        ...payment,
                        clientName: sale.clientName,
                        productName: sale.productName,
                        saleId: sale._id,
                        totalPrice: sale.price,
                        totalPaid,
                        remainingAmount,
                        progressPercentage,
                        isCompleted,
                        settlementDate: sale.settledDate
                    });
                });
            }
        });
        return payments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function displayPayments(payments) {
        paymentsList.innerHTML = "";
    
        if (payments.length === 0) {
            paymentsList.innerHTML = "<div class='empty-message'>No hay abonos para mostrar.</div>";
            return;
        }
    
        payments.forEach(payment => {
            const card = document.createElement("div");
            card.classList.add("payment-card");
    
            const paymentDate = new Date(payment.date).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            const paymentTime = new Date(payment.date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const statusClass = payment.isCompleted ? "completed" : "pending";
            const statusText = payment.isCompleted ? "Crédito completado" : "Crédito pendiente";
            
            let settlementInfo = '';
            if (payment.settlementDate) {
                const settlementDate = new Date(payment.settlementDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                settlementInfo = `
                    <div class="settlement-info">
                        <span class="detail-label">Liquidado el:</span>
                        <span class="detail-value">${settlementDate}</span>
                    </div>
                `;
            }
    
            card.innerHTML = `
                <div class="payment-header">
                    <div class="client-info">
                        <h3>${payment.clientName}</h3>
                        <span class="status-badge">Abono</span>
                    </div>
                    <div class="product-name">${payment.productName}</div>
                </div>
                
                <div class="payment-details">
                    <div class="detail-row">
                        <div class="detail-group">
                            <span class="detail-label">Monto abonado:</span>
                            <span class="detail-value amount">${payment.amount.toLocaleString()} COP</span>
                        </div>
                        
                        <div class="detail-group">
                            <span class="detail-label">Precio total:</span>
                            <span class="detail-value">${payment.totalPrice.toLocaleString()} COP</span>
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <span class="detail-label">Progreso de pago:</span>
                        <div class="payment-progress">
                            <div class="progress-bar" style="width: ${payment.progressPercentage}%"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                            <span class="detail-value">${payment.totalPaid.toLocaleString()} COP</span>
                            <span class="detail-value remaining">${payment.remainingAmount.toLocaleString()} COP</span>
                        </div>
                    </div>
                    
                    <div class="credit-status">
                        <div class="status-indicator ${statusClass}"></div>
                        <span>${statusText}</span>
                    </div>
                    
                    <div class="payment-info">
                        <div class="payment-date">
                            <div class="date-icon">📅</div>
                            <div>
                                <span class="detail-label">Fecha del abono:</span>
                                <span class="detail-value">${paymentDate} a las ${paymentTime}</span>
                            </div>
                        </div>
                        ${settlementInfo}
                    </div>
                </div>
                
                <div class="card-actions">
                    <button class="delete-btn" data-id="${payment._id}" data-sale-id="${payment.saleId}">
                        <span class="btn-icon">🗑️</span> Eliminar abono
                    </button>
                </div>
            `;
    
            // Acción del botón eliminar
            card.querySelector(".delete-btn").addEventListener("click", async (e) => {
                const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este abono?");
                if (confirmDelete) {
                    try {
                        const token = getToken();
                        const saleId = e.target.closest(".delete-btn").dataset.saleId;
                        const paymentId = e.target.closest(".delete-btn").dataset.id;
                        
                        await apiFetch(`/sales/${saleId}/payment/${paymentId}`, "DELETE", null, token);

                        // Animación de eliminación
                        const paymentCard = e.target.closest(".payment-card");
                        paymentCard.classList.add("deleting");
                        
                        setTimeout(() => {
                            // Actualizar la lista de pagos
                            allPayments = allPayments.filter(p => p._id !== paymentId);
                            
                            if (allPayments.length === 0) {
                                paymentsList.innerHTML = "<div class='empty-message'>No hay abonos para mostrar.</div>";
                                emptyState.style.display = "block";
                            } else {
                                paymentCard.remove();
                            }
                            
                            updateTotalPayments(allPayments);
                        }, 300);
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
        
        if (searchText || dateValue) {
            clearFiltersBtn.style.display = "block";
        } else {
            clearFiltersBtn.style.display = "none";
        }
        
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
        
        if (filteredPayments.length === 0) {
            paymentsList.innerHTML = "<div class='empty-message'>No hay abonos que coincidan con los filtros aplicados.</div>";
        } else {
            displayPayments(filteredPayments);
        }
        
        updateTotalPayments(filteredPayments);
    }

    function clearFilters() {
        searchInput.value = "";
        dateFilter.value = "";
        clearFiltersBtn.style.display = "none";
        displayPayments(allPayments);
        updateTotalPayments(allPayments);
    }




});

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
