import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        default: null
    },
    image: {
        type: String,
        default: null
    },
}, {timestamps: true});

const categoryModel = mongoose.model("category", categorySchema);

export default categoryModel;

