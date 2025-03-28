const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    clave: {
        type: String,
        required: true,
        trim: true
    },
    imagen: {
        type: String, // Guardará la imagen en formato base64
        required: true
    },
    precio: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
