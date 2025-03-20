const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    saleDate: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    installments: {
        type: Number,
        default: 1
    },
    advancePayment: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Sale", SaleSchema);
