const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(100),
        image: Joi.string().allow("",null),
        category:Joi.string().allow("Tranding", "Arctic", "Tower", "Top Cities", "Rooms", "Island", "Historical", "Camping", "Amazing View", "Beachfront", "Castles", "Mountain View")
    }).required()
});

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required(),
    }).required()
});