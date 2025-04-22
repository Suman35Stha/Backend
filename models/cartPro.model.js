import mongoose from "mongoose";

const cartProSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null 
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        default: null
    },
    quantity: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const cartProModel = mongoose.model("cartProduct", cartProSchema);

export default cartProModel;


