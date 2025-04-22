import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    },
    productId: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        unique: true,
        default: null
        }
    ],
    deliveryAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
        default: null
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "delivered", "cancelled"],
        default: "pending"
    },
    quantity: { 
        type: Number,
        default: 0
    },
    subTotal: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        default: 0
    },
    invoice: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["pending", "delivered", "cancelled"],
        default: "pending"
    },
    paymentId: {
        type: String,
        default: null
    },
    paymentMethod: {
        type: String,
        default: "cash"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    }
}, {timestamps: true});

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;


