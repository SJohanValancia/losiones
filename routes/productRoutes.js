const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const auth = require("../middleware/auth"); // Importamos el middleware de autenticación
const router = express.Router();

// 🟢 Crear un nuevo producto
router.post("/new", async (req, res) => {
    try {
        const { nombre, descripcion, clave, imagen, precio } = req.body;

        if (!nombre || !descripcion || !clave || !imagen || !precio) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const product = new Product({ nombre, descripcion, clave, imagen, precio });
        await product.save();

        res.status(201).json({ mensaje: "Producto agregado correctamente", producto: product });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: "Error al agregar el producto" });
    }
});

// 🔵 Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});

// 🔵 Obtener un producto específico
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el producto" });
    }
});

// 🟠 Actualizar un producto
router.put("/:id", async (req, res) => {
    try {
        const { nombre, descripcion, clave, imagen, precio } = req.body;
        
        // Validar campos obligatorios
        if (!nombre || !descripcion || !clave || !precio) {
            return res.status(400).json({ error: "Faltan campos obligatorios" });
        }
        
        // Buscar el producto
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Actualizar campos
        product.nombre = nombre;
        product.descripcion = descripcion;
        product.clave = clave;
        product.precio = precio;
        
        // Solo actualizar la imagen si se proporciona una nueva
        if (imagen) {
            product.imagen = imagen;
        }

        await product.save();
        res.json({ mensaje: "Producto actualizado correctamente", producto: product });
    } catch (error) {
        console.error("Error al actualizar:", error);
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// 🔴 Eliminar un producto
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

module.exports = router;