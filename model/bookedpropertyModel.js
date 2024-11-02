const mongoose = require('mongoose');

const bookedpropertySchema = new mongoose.Schema({
    user_email: {
        type: String,
    },
    property_id: {
        type: Number,
    },
    image: {
        type: String,
    },
    prprty: {
        type: String,
    },
    landlord_email: {
        type: String,
    },
    rent: {
        type: String,
    },
    payment_done: {
        type: Boolean,
    },
    landlord_email: {
        deleted: Boolean,
    }
}, { timestamps: true }, { collection: 'bookedproperties' }); // Specifies the collection name

const bookedpropertyModel = mongoose.model('Bookedproperty', bookedpropertySchema);

module.exports = bookedpropertyModel;