import { apiFetch } from "./utils/api.js";
import { getToken } from "./utils/auth.js";

// DOM elements
const form = document.getElementById("productForm");
const inputId = document.getElementById("productId");
const inputName = document.getElementById("productName");
const inputCostPrice = document.getElementById("costPrice");
const inputSalePrice = document.getElementById("salePrice");

const btnSave = document.getElementById("saveProduct");
const btnUpdate = document.getElementById("updateProduct");
const btnCancel = document.getElementById("cancelUpdate");
const btnDelete = document.getElementById("deleteProduct");
const productsList = document.getElementById("productsList");

// Load products
async function loadProducts() {
    try {
        const token = getToken();
        if (!token) {
            window.location.href = "login.html";
            return;
        }
        
        const products = await apiFetch("/products", "GET", null, token);
        const availableProducts = products.filter(product => !product.sold);
        
        productsList.innerHTML = "";
        
        if (availableProducts.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.textContent = "No hay productos disponibles";
            emptyMessage.classList.add("empty-message");
            productsList.appendChild(emptyMessage);
            return;
        }
        
        availableProducts.forEach(product => {
            const li = document.createElement("li");
            li.classList.add("product-item");
            
            li.innerHTML = `
                <span>${product.name} - Costo: ${product.costPrice} COP - Venta: ${product.salePrice} COP</span>
                <div class="buttons-container">
                    <button class="edit btn">Editar</button>
                    <button class="delete btn">Eliminar</button>
                </div>
            `;
            
            li.querySelector(".edit").addEventListener("click", () => editProduct(product));
            li.querySelector(".delete").addEventListener("click", () => deleteProduct(product._id));
            
            productsList.appendChild(li);
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert("No se pudieron cargar los productos");
    }
}

// Save a new product
async function saveProduct() {
    const productData = {
        name: inputName.value.trim(),
        costPrice: parseFloat(inputCostPrice.value),
        salePrice: parseFloat(inputSalePrice.value)
    };
    
    if (!productData.name || isNaN(productData.costPrice) || isNaN(productData.salePrice)) {
        alert("Completa todos los campos requeridos.");
        return;
    }
    
    try {
        const token = getToken();
        await apiFetch("/products/new", "POST", productData, token);
        alert("Producto guardado correctamente.");
        form.reset();
        loadProducts();
    } catch (error) {
        console.error("Error al guardar el producto:", error.message);
        alert("No se pudo guardar el producto: " + error.message);
    }
}

// Edit a product
function editProduct(product) {
    inputId.value = product._id;
    inputName.value = product.name;
    inputCostPrice.value = product.costPrice;
    inputSalePrice.value = product.salePrice;
    
    btnSave.style.display = "none";
    btnUpdate.style.display = "inline-block";
    btnCancel.style.display = "inline-block";
    btnDelete.style.display = "inline-block";
}

// Update a product
async function updateProduct() {
    const id = inputId.value;
    
    const productData = {
        name: inputName.value.trim(),
        costPrice: parseFloat(inputCostPrice.value),
        salePrice: parseFloat(inputSalePrice.value)
    };
    
    try {
        const token = getToken();
        await apiFetch(`/products/${id}`, "PUT", productData, token);
        alert("Producto actualizado correctamente.");
        cancelUpdate();
        loadProducts();
    } catch (error) {
        console.error("Error al actualizar el producto:", error.message);
        alert("No se pudo actualizar el producto: " + error.message);
    }
}

// Delete a product
async function deleteProduct(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        return;
    }
    
    try {
        const token = getToken();
        await apiFetch(`/products/${id}`, "DELETE", null, token);
        alert("Producto eliminado correctamente.");
        
        if (inputId.value === id) {
            cancelUpdate();
        }
        
        loadProducts();
    } catch (error) {
        console.error("Error al eliminar el producto:", error.message);
        alert("No se pudo eliminar el producto.");
    }
}

// Cancel update
function cancelUpdate() {
    btnSave.style.display = "inline-block";
    btnUpdate.style.display = "none";
    btnCancel.style.display = "none";
    btnDelete.style.display = "none";
    form.reset();
}

// Event listeners
btnSave.addEventListener("click", saveProduct);
btnUpdate.addEventListener("click", updateProduct);
btnCancel.addEventListener("click", cancelUpdate);
btnDelete.addEventListener("click", deleteProduct);

// Load products when page loads
document.addEventListener("DOMContentLoaded", loadProducts);

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
