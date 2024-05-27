const mongoose = require('mongoose');

const AddToCartSchema= new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'PRODUCT',
        required: true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'USER',
        required: true
    },
    quantity:{
        type:String,
        required:true
    }
})
const cart = mongoose.model("CART", AddToCartSchema);

module.exports = cart;