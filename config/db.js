const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("🟢 Conexión a MongoDB exitosa");
    } catch (error) {
        console.error("🔴 Error en la conexión a MongoDB:", error.message);
        process.exit(1); // Detiene la ejecución si hay un error
    }
};

module.exports = connectDB;
