const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    image: {
        type: String,
    },
    image2: {
        type: String,
    },
    image3: {
        type: String,
    },
    building_name: {
        type: String,
    },
    flat_name: {
        type: String,
    },
    rent: {
        type: String,
    },
    size: {
        type: String,
    },
    availability: {
        type: Number,
    },
    status: {
        deleted: String,
    }
}, { timestamps: true }, { collection: 'porperties' }); // Specifies the collection name

const propertyModel = mongoose.model('Property', propertySchema);

module.exports = propertyModel;