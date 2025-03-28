import { apiFetch } from "./utils/api.js";

// Referencias a elementos del DOM
const productosContainer = document.getElementById("productos");
const buscarInput = document.getElementById("buscar");
const loader = document.getElementById("loader");

// Variable global para almacenar los productos cargados
let productosGlobales = [];

// Función para normalizar texto (quita tildes y convierte a minúsculas)
function normalizarTexto(texto) {
    return texto
        .normalize("NFD") // Separa caracteres con tildes
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") // Elimina signos de puntuación
        .toLowerCase(); // Convierte todo a minúsculas
}

// Función para cargar todos los productos
async function cargarProductos() {
    try {
        loader.style.display = "block";
        productosContainer.innerHTML = "";
        
        productosGlobales = await apiFetch("/products", "GET");
        
        if (!productosGlobales || productosGlobales.length === 0) {
            productosContainer.innerHTML = "<p>No hay productos disponibles en este momento</p>";
            return;
        }
        
        mostrarProductos(productosGlobales);
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        productosContainer.innerHTML = "<p>Error al cargar los productos. Por favor, intenta más tarde.</p>";
    } finally {
        loader.style.display = "none";
    }
}

// Función para filtrar productos según el término de búsqueda
function filtrarProductos(term) {
    const termNormalizado = normalizarTexto(term.trim());

    if (termNormalizado === "") {
        mostrarProductos(productosGlobales); // Restaurar lista completa si el usuario borra
        return;
    }

    const productosFiltrados = productosGlobales.filter(producto => {
        const nombre = normalizarTexto(producto.nombre);
        const descripcion = normalizarTexto(producto.descripcion);
        const palabraClave = normalizarTexto(producto.clave || "");

        return (
            nombre.includes(termNormalizado) || 
            descripcion.includes(termNormalizado) || 
            palabraClave.includes(termNormalizado)
        );
    });

    mostrarProductos(productosFiltrados);
}

// Función para mostrar productos en el contenedor
function mostrarProductos(productos) {
    productosContainer.innerHTML = "";

    if (productos.length === 0) {
        productosContainer.innerHTML = `<p class="no-resultados">No se encontraron resultados</p>`;
        return;
    }

    productos.forEach(producto => {
        const productoDiv = document.createElement("div");
        productoDiv.className = "producto";
        productoDiv.dataset.clave = producto.clave || "";
        
        // Crear número de WhatsApp
        const whatsappNumber = "573225949495";
        const whatsappMessage = encodeURIComponent(`Hola, estoy interesado en el producto: ${producto.nombre}`);
        
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="descripcion">${producto.descripcion}</p>
            <p>$${producto.precio.toFixed(2)}</p>
            <a href="https://wa.me/${whatsappNumber}?text=${whatsappMessage}" 
               class="btn-whatsapp" target="_blank">
                Comprar por WhatsApp
            </a>
        `;

        productosContainer.appendChild(productoDiv);
    });
}

// Evento para búsqueda en tiempo real
buscarInput.addEventListener("input", function() {
    filtrarProductos(this.value);
});

// Cargar productos al iniciar la página
document.addEventListener("DOMContentLoaded", cargarProductos);
