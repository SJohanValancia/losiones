document.addEventListener("DOMContentLoaded", () => {
    const saleDetailsContainer = document.getElementById("saleDetails");
    const paymentsContainer = document.getElementById("paymentsDetails");
    const sale = JSON.parse(localStorage.getItem("saleDetails"));

    if (!sale) {
        saleDetailsContainer.innerHTML = "<p>No hay detalles disponibles.</p>";
        return;
    }

    // Calcular el total abonado
    const totalPaid = sale.totalPaid || sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingDebt = sale.price - totalPaid;

    saleDetailsContainer.innerHTML = `
        <p><strong>ID:</strong> ${sale._id}</p>
        <p><strong>Cliente:</strong> ${sale.clientName}</p>
        <p><strong>Producto:</strong> ${sale.productName}</p>
        <p><strong>Fecha:</strong> ${new Date(sale.saleDate).toLocaleDateString()}</p>
        <p><strong>Precio:</strong> ${sale.price} COP</p>
        <p><strong>Cuotas:</strong> ${sale.installments}</p>
        <p><strong>Total abonado:</strong> ${totalPaid} COP</p>
        <p><strong>Deuda restante:</strong> ${remainingDebt} COP</p>
        <p><strong>Dirección:</strong> ${sale.address || 'No disponible'}</p> <!-- Mostrar dirección -->
    `;

    // Mostrar el historial de abonos
    if (sale.payments && sale.payments.length > 0) {
        let paymentsHTML = `
            <h2>Historial de Abonos</h2>
            <table class="payments-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sale.payments.forEach(payment => {
            paymentsHTML += `
                <tr>
                    <td>${new Date(payment.date).toLocaleDateString()}</td>
                    <td>${payment.amount} COP</td>
                </tr>
            `;
        });

        paymentsHTML += `
                </tbody>
            </table>
        `;
        
        paymentsContainer.innerHTML = paymentsHTML;
    } else {
        paymentsContainer.innerHTML = "<p>No hay abonos registrados.</p>";
    }
});

function goBack() {
    window.location.href = "categories.html";
}
