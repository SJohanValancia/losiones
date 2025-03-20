const express = require("express");
const Expense = require("../models/Expense");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/new", auth, async (req, res) => {
    try {
        const { title, amount, date, category } = req.body;
        if(!title || !amount || !category) {
            return res.status(400).json({error: "Todos los campos son obligatorios"})
        }
        const expense = new Expense({
            title,
            amount,
            date: date || Date.now(),
            category,
            user: req.user.id
        })
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
})

//Listar los gastos
router.get("/", auth, async (req, res) => {
  try {
      // Buscar gastos y hacer populate de la categoría
      const expenses = await Expense.find({ user: req.user.id })
          .populate('category', 'name') // Esto es crucial - populate la referencia a categoría
          .sort({ date: -1 }); // Ordenar por fecha descendente
      
      res.json(expenses);
  } catch (error) {
      console.error("Error al obtener gastos:", error);
      res.status(500).json({ error: "Error al obtener los gastos" });
  }
});

//Actualizar un gasto
//Eliminar un gasto

router.delete("/:id", auth, async (req, res) => {
  try {
      const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!expense) {
          return res.status(404).json({ error: "Gasto no encontrado" });
      }
      res.status(200).json({ message: "Gasto eliminado correctamente" });
  } catch (error) {
      res.status(400).json({ error: error.message });
  }
});

module.exports = router;