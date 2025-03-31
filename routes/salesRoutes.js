const express = require("express");
const auth = require("../middleware/auth");
const Sale = require("../models/Sale");
const router = express.Router();

// Obtener todas las ventas (liquidadas y no liquidadas)
router.get("/all", auth, async (req, res) => {
    try {
        const sales = await Sale.find({ user: req.user.id });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener todas las ventas" });
    }
});

// Marcar una venta como liquidada
router.patch("/:id/settle", auth, async (req, res) => {
    try {
        const sale = await Sale.findOne({ _id: req.params.id, user: req.user.id });

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // Marcar como liquidada
        sale.settled = true;
        sale.settledDate = new Date();

        await sale.save();
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: "Error al liquidar la venta" });
    }
});

// Obtener todas las ventas, excluyendo las liquidadas
router.get("/", auth, async (req, res) => {
    try {
        const sales = await Sale.find({ 
            user: req.user.id, 
            settled: { $ne: true }  // Excluir ventas donde settled es true
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las ventas" });
    }
});



// Obtener todas las ventas liquidadas del usuario
router.get("/settled", auth, async (req, res) => {
    try {
        const sales = await Sale.find({ user: req.user.id, settled: true });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las ventas liquidadas" });
    }
});

// Crear nueva venta
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
        console.error("Error en el servidor:", error);
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una venta
router.put("/:id", auth, async (req, res) => {
    const { clientName, productName, saleDate, price, installments } = req.body;

    try {
        const sale = await Sale.findOne({ _id: req.params.id, user: req.user.id });

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // Actualizamos los datos básicos
        sale.clientName = clientName;
        sale.productName = productName;
        sale.saleDate = saleDate;
        sale.price = price;
        sale.installments = installments;

        await sale.save();
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la venta" });
    }
});

// Agregar un nuevo abono
router.post("/:id/payment", auth, async (req, res) => {
    const { amount, date } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "El monto del abono debe ser mayor a cero" });
    }

    try {
        const sale = await Sale.findOne({ _id: req.params.id, user: req.user.id });

        if (!sale) {
            return res.status(404).json({ error: "Venta no encontrada" });
        }

        // Agregamos el nuevo abono
        sale.payments.push({
            amount,
            date: date || new Date()
        });

        await sale.save();
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar el abono" });
    }
});

// Eliminar una venta
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