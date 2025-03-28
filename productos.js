import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

// Referencias a elementos del DOM
const form = document.getElementById("formulario");
const inputNombre = document.getElementById("nombre");
const inputDescripcion = document.getElementById("descripcion");
const inputClave = document.getElementById("clave");
const inputImagen = document.getElementById("imagen");
const inputPrecio = document.getElementById("precio");
const productList = document.getElementById("productList");

let editProductId = null; // Almacena el ID del producto en edición

// Cargar productos existentes al iniciar
async function loadProducts() {
    try {
        const products = await apiFetch("/products", "GET");
        productList.innerHTML = "";
        
        if (products.length === 0) {
            productList.innerHTML = "<p>No hay productos disponibles</p>";
            return;
        }
        
        products.forEach((product) => {
            const div = document.createElement("div");
            div.classList.add("product-card");
            div.innerHTML = `
                <img src="${product.imagen}" alt="${product.nombre}" style="max-width: 100%; height: auto;">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <p><strong>Precio:</strong> $${product.precio.toFixed(2)}</p>
                <button class="btn-small edit-btn" data-id="${product._id}">Editar</button>
                <button class="btn-small" style="background: #e74c3c;" data-id="${product._id}">Eliminar</button>
            `;

            div.querySelector(".edit-btn").addEventListener("click", () => fillFormForEdit(product));
            div.querySelector("[style='background: #e74c3c;']").addEventListener("click", () => deleteProduct(product._id));
            productList.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        productList.innerHTML = "<p>Error al cargar los productos</p>";
    }
}

// Rellenar formulario para edición
function fillFormForEdit(product) {
    inputNombre.value = product.nombre;
    inputDescripcion.value = product.descripcion;
    inputClave.value = product.clave;
    inputPrecio.value = product.precio;
    editProductId = product._id; // Guardar el ID del producto en edición
    
    // Cambiar texto del botón para indicar que está en modo edición
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.textContent = "Actualizar Producto";
    
    // Scroll hacia el formulario
    form.scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición
function cancelEdit() {
    editProductId = null;
    form.reset();
    const submitButton = form.querySelector("button[type='submit']");
    submitButton.textContent = "Guardar Producto";
}

// Guardar o actualizar un producto
async function saveProduct(event) {
    event.preventDefault();

    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const clave = inputClave.value.trim();
    const precio = parseFloat(inputPrecio.value);
    
    if (!nombre || !descripcion || !clave || isNaN(precio)) {
        alert("Completa todos los campos obligatorios.");
        return;
    }

    const productData = {
        nombre,
        descripcion,
        clave,
        precio
    };

    // Si hay un archivo de imagen seleccionado, procesar la imagen
    if (inputImagen.files && inputImagen.files[0]) {
        const reader = new FileReader();
        reader.onload = async function() {
            productData.imagen = reader.result;
            await sendProductData(productData);
        };
        reader.readAsDataURL(inputImagen.files[0]);
    } else if (editProductId) {
        // Si estamos editando y no se seleccionó una nueva imagen, continuamos sin cambiar la imagen
        try {
            // Obtener la imagen actual del producto
            const currentProduct = await apiFetch(`/products/${editProductId}`, "GET");
            productData.imagen = currentProduct.imagen;
            await sendProductData(productData);
        } catch (error) {
            console.error("Error al obtener el producto actual:", error);
            alert("Error al obtener la información del producto: " + error.message);
        }
    } else {
        alert("Selecciona una imagen para el producto.");
    }
}

// Enviar datos al backend para crear o actualizar
async function sendProductData(productData) {
    try {
        if (editProductId) {
            // Actualizar producto existente
            await apiFetch(`/products/${editProductId}`, "PUT", productData);
            alert("Producto actualizado correctamente.");
            editProductId = null;
            
            // Restaurar el texto del botón
            const submitButton = form.querySelector("button[type='submit']");
            submitButton.textContent = "Guardar Producto";
        } else {
            // Crear un nuevo producto
            await apiFetch("/products/new", "POST", productData);
            alert("Producto agregado correctamente.");
        }
        form.reset();
        loadProducts();
    } catch (error) {
        console.error("Error al guardar producto:", error);
        alert("No se pudo guardar el producto: " + error.message);
    }
}

// Eliminar un producto
async function deleteProduct(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
        await apiFetch(`/products/${id}`, "DELETE");
        alert("Producto eliminado correctamente.");
        loadProducts();
    } catch (error) {
        console.error("Error al eliminar el producto:", error);
        alert("No se pudo eliminar el producto: " + error.message);
    }
}

// Eventos
form.addEventListener("submit", saveProduct);

// Agregar botón de cancelar edición
const cancelButton = document.createElement("button");
cancelButton.textContent = "Cancelar Edición";
cancelButton.type = "button";
cancelButton.className = "btn";
cancelButton.style.backgroundColor = "#e74c3c";
cancelButton.style.marginTop = "10px";
cancelButton.style.display = "none";
cancelButton.addEventListener("click", cancelEdit);

// Agregar el botón después del formulario
form.appendChild(cancelButton);

// Modificar la función fillFormForEdit para mostrar el botón de cancelar
const originalFillFormForEdit = fillFormForEdit;
fillFormForEdit = function(product) {
    originalFillFormForEdit(product);
    cancelButton.style.display = "block";
};

// Modificar la función cancelEdit para ocultar el botón
const originalCancelEdit = cancelEdit;
cancelEdit = function() {
    originalCancelEdit();
    cancelButton.style.display = "none";
};

document.addEventListener("DOMContentLoaded", loadProducts);