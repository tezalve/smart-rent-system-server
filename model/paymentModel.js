const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    amount: {
        type: Number,
    },
    trxID: {
        type: String,
    },
    paymentID: {
        type: String,
    },
    date: {
        type: String,
    }
}, { timestamps: true }, { collection: 'payments' }); // Specifies the collection name

const paymentModel = mongoose.model('Payment', paymentSchema);

module.exports = paymentModel;