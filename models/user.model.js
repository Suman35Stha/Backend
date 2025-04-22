import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        // unique: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please use a valid email address"
        ]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"]
    },
    password_expiry_date: {
        type: Date,
        default: null
    },
    image: {
        type: String,
        default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
    },
    mobile: {
        type: Number,
        required: true,
        // unique: true,
        match: [/^[0-9]{10}$/, "Please use a valid mobile number"],
        trim: true
    },
    verify_email: {
        type: Boolean,
        default: false
    },
    last_login: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active"
    },
    address: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "address"
    }],
    shopping_cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "cartProduct"
    }],
    order_history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "order"
    }],
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, {timestamps: true});

const userModel = mongoose.model("User", userSchema);

export default userModel; 