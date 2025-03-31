async function loadSoldProducts() {
    try {
        const token = getToken();
        if (!token) {
            window.location.href = "index.html";
            return;
        }

        const products = await apiFetch("/products", "GET", null, token);
        const soldProducts = products.filter(product => product.sold); // 🔹 Filtrar solo los vendidos
        displayProducts(soldProducts);
        updateTotalProducts(soldProducts);
    } catch (error) {
        console.error("Error al cargar productos vendidos:", error);
        alert("No se pudieron cargar los productos vendidos.");
    }
}

// Cargar la lista cuando se cargue la página de "Vendidos"
document.addEventListener("DOMContentLoaded", loadSoldProducts);
