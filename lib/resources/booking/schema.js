import Joi from 'joi';

export default Joi.object({
    customer_id     : Joi.string().required(),
    team_id         : Joi.string(),
    // transaction_id  : Joi.string(),
    business_date   : Joi.date().iso().raw().required(),
    start_time      : Joi.number().min(830),
    end_time        : Joi.number().max(1830),
    photos          : Joi.object(),
    job_details     : Joi.object({
        bed     : Joi.number().min(1),
        bath    : Joi.number().min(1),
        cabinets: Joi.boolean(),
        fridge  : Joi.boolean(),
        oven    : Joi.boolean(),
        laundry : Joi.boolean(),
        type    : Joi.string().valid('standard', 'standard plus', 'deep clean', 'move out'),
    }),
    booking_details : Joi.object({
        address             : Joi.string().required(),
        pets                : Joi.boolean(),
        pets_notes          : Joi.string(),
        entry_method        : Joi.string().valid('home', 'doorman', 'hidden','other').required(),
        entry_instructions  : Joi.string(),
        additional_notes    : Joi.string()
    }),
});