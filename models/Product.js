const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    costPrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sold: { type: Boolean, default: false }  // Nuevo campo
}, { timestamps: true });


module.exports = mongoose.model("Product", ProductSchema);