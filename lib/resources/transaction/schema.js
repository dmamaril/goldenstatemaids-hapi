import Joi from 'joi';

const costSchema = Joi.object({
    coupon                  : Joi.string().min(1),
    coupon_discount         : Joi.number(),
    subtotal                : Joi.number().required(),
    recurring_discount_rate : Joi.number().required(),
    tax_total               : Joi.number().required(),
    tax_rate                : Joi.number().required(),
    total                   : Joi.number().required(),
});

export default Joi.object({
    booking_id      : Joi.string().required(),
    notes           : Joi.string(),
    final_cost      : costSchema,
    initial_cost    : costSchema,
});