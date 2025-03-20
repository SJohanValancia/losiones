document.addEventListener("DOMContentLoaded", () => {
    const saleDetailsContainer = document.getElementById("saleDetails");
    const sale = JSON.parse(localStorage.getItem("saleDetails"));

    if (!sale) {
        saleDetailsContainer.innerHTML = "<p>No hay detalles disponibles.</p>";
        return;
    }

    // Calcular deuda restante
    const remainingDebt = sale.price - sale.advancePayment;

    saleDetailsContainer.innerHTML = `
        <p><strong>ID:</strong> ${sale._id}</p>
        <p><strong>Cliente:</strong> ${sale.clientName}</p>
        <p><strong>Producto:</strong> ${sale.productName}</p>
        <p><strong>Fecha:</strong> ${new Date(sale.saleDate).toLocaleDateString()}</p>
        <p><strong>Precio:</strong> ${sale.price} COP</p>
        <p><strong>Cuotas:</strong> ${sale.installments}</p>
        <p><strong>Total abonado:</strong> ${sale.advancePayment} COP</p>
        <p><strong>Deuda restante:</strong> ${remainingDebt} COP</p>
    `;
});

function goBack() {
    window.location.href = "categories.html"
}
