const mongoose = require('mongoose')

const productschema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product's name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please enter product's description"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product's price"],
        maxLength: [8, "Price cannot exceed more than 8 characters"]
    },
    rating: {
        type: Number,
        default: 0
    },
    images: [
        {
            product_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }

        }
    ],
    category: {
        type: String,
        required: [true, "Please enter product's category"]
    },
    Stock: {
        type: Number,
        required: [true, "Please enter product's stock"],
        maxLength: [4, "Stock cannot be more than 4 characters"],
        default: 1
    },
    numOfReviews: {
        type: Number,
        required: true,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("Product", productschema)