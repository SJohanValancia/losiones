const express = require("express");
const auth = require("../middleware/auth");
const Sale = require("../models/Sale");
const router = express.Router();

// 🟢 Crear nueva venta
router.post("/new", auth, async (req, res) => {
    try {
        const { clientName, productName, saleDate, price, installments, advancePayment } = req.body;

        if (!clientName || !productName || !saleDate || !price) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const sale = new Sale({
            clientName,
            productName,
            saleDate,
            price,
            installments,
            advancePayment,
            user: req.user.id
        });

        await sale.save();
        res.status(201).json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔵 Obtener todas las ventas del usuario
router.get("/", auth, async (req, res) => {
    try {
        const sales = await Sale.find({ user: req.user.id });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las ventas" });
    }
});

// 🟠 Actualizar una venta
router.put("/:id", auth, async (req, res) => {
    const { clientName, productName, saleDate, price, installments, advancePayment } = req.body;

    try {
        const sale = await Sale.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { clientName, productName, saleDate, price, installments, advancePayment },
            { new: true, runValidators: true }
        );

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la venta" });
    }
});

// 🔴 Eliminar una venta
router.delete("/:id", auth, async (req, res) => {
    try {
        const sale = await Sale.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        res.json({ message: "Venta eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la venta" });
    }
});

module.exports = router;
