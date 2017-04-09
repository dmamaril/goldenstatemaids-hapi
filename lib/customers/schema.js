import Joi from 'joi';

export default Joi.object({
    first_name      : Joi.string().required(),
    last_name       : Joi.string().required(),
    email           : Joi.string().email().required(),
    address         : Joi.string().required(),
    stripe_id       : Joi.string().required(),
    preferred_team  : Joi.string(),
    num_bookings    : Joi.number().min(0),
    book_history    : Joi.object(),
    notes           : Joi.string(),
    is_flagged      : Joi.boolean(),
    flag_notes      : Joi.string()
});