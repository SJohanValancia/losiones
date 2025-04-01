const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const validator = require("validator");
const auth = require("../middleware/auth");

const router = express.Router();


// Ruta para iniciar sesión como un usuario
router.post("/login-as/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        // Verifica si el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Genera un token para el usuario
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Devuelve el token
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Error al intentar iniciar sesión" });
    }
});


// 🟢 Registrar usuario
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: "Email inválido" });
        }
        if (!validator.isLength(password, { min: 6 })) {
            return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Ya existe un usuario con este correo" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 🔵 Iniciar sesión (Login)
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "los datos de inicio de sesión no coinciden, intentelo de nuevo" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 🟠 Verificar token
router.get("/verify", auth, (req, res) => {
    res.status(200).json({ message: "Token válido", user: req.user });
});

module.exports = router;
