import mongoose from "mongoose";
import path from "path";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        default: null
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        default: null
    },
    moreDescription: {
        type: String,
        default: null
    },
    image: [
        {
            type: String,
            default: null
        }
    ],    
    categoryId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            default: null
        }
    ],
    subCategoryId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subCategory",
            default: null
        }
    ],
    unit: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        default: 0
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    publish: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const productModel = mongoose.model("product", productSchema);

export default productModel;

