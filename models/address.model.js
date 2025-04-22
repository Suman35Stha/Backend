import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: [true, "Address is required"],
        default: null
    },
    city: {
        type: String,
        required: [true, "City is required"],
        default: null
    },
    state: {
        type: String,
        required: [true, "State is required"],
        default: null
    },
    country: {
        type: String,
        required: [true, "Country is required"],
        default: null
    },
    pincode: {
        type: String,
        required: [true, "Pincode is required"],
        default: null
    },
    phone: {
        type: String,
        required: [true, "Phone is required"],
        default: null
    }
}, {timestamps: true});

const addressModel = mongoose.model("address", addressSchema);

export default addressModel;

