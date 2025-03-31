const express = require("express");
const auth = require("../middleware/auth");
const Product = require("../models/Product");
const router = express.Router();

// Get all products for the logged in user
router.get("/", auth, async (req, res) => {
    try {
        const products = await Product.find({ user: req.user.id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los productos" });
    }
});

// Create a new product
router.post("/new", auth, async (req, res) => {
    try {
        const { name, costPrice, salePrice } = req.body;

        // Log received data for debugging
        console.log("Datos recibidos en el servidor:", { 
            name, 
            costPrice, 
            salePrice 
        });

        if (!name || !costPrice || !salePrice) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const product = new Product({
            name,
            costPrice,
            salePrice,
            user: req.user.id
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update a product
router.put("/:id", auth, async (req, res) => {
    const { name, costPrice, salePrice } = req.body;

    try {
        const product = await Product.findOne({ _id: req.params.id, user: req.user.id });

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        // Update the product data
        product.name = name;
        product.costPrice = costPrice;
        product.salePrice = salePrice;

        await product.save();
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
});

// Delete a product
router.delete("/:id", auth, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

// Marcar un producto como vendido
router.put("/:id/sell", auth, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, user: req.user.id });

        if (!product) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        product.sold = true; // Marcar como vendido
        await product.save();

        res.json({ message: "Producto marcado como vendido", product });
    } catch (error) {
        res.status(500).json({ error: "Error al marcar como vendido" });
    }
});


module.exports = router;