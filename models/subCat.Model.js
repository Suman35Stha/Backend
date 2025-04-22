import mongoose from "mongoose";

const subCatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        default: null
    },
    image: {
        type: String,
        default: null
    },
    categoryId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
            default: null
        }
    ],
}, {timestamps: true});

const subCatModel = mongoose.model("subCategory", subCatSchema);

export default subCatModel;

