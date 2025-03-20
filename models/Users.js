const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"]
    },
    email: {
        type: String,
        required: [true, "El correo es obligatorio"],
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"]
    }
})
module.exports = mongoose.model("User", userSchema);