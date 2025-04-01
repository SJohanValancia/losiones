const SaleSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    clientAddress: {  // Nuevo campo para dirección
        type: String,
        required: true,  // Cambia esto a `false` si no es obligatorio
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
        type: String,
        default: 1
    },
    payments: [PaymentSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    settled: {
        type: Boolean,
        default: false
    },
    settledDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });
