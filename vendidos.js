import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js"; // ✅ Asegúrate de importar getToken

async function loadSoldProducts() {
    try {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const products = await apiFetch("/products", "GET", null, token);

        // Filtrar solo productos vendidos
        const soldProducts = products.filter(product => product.sold);

        displayProducts(soldProducts);
    } catch (error) {
        console.error("Error al cargar productos vendidos:", error);
        alert("No se pudieron cargar los productos vendidos.");
    }
}

document.addEventListener("DOMContentLoaded", loadSoldProducts);
