import Joi from 'joi';

export default Joi.object({
    first_name      : Joi.string().required(),
    last_name       : Joi.string().required(),
    stripe_id       : Joi.string().required(),
    address         : Joi.string().required(),
    email           : Joi.string().email().required(),
    stripe_id       : Joi.string(),
    preferred_team  : Joi.string(),
    num_bookings    : Joi.number().min(0),
    book_history    : Joi.array().items(Joi.string()),
    notes           : Joi.string(),
    is_flagged      : Joi.boolean(),
    flag_notes      : Joi.string()
});