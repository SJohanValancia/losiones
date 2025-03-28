const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); 
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: '50mb' })); // Aumentamos el límite para manejar imágenes base64

// 🟢 Habilitar CORS para permitir peticiones desde el frontend
app.use(cors({
    origin: ["http://127.0.0.1:5501", "http://localhost:5501"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Cambiamos a 'products' para más claridad

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));