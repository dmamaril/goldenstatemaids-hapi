import Joi from 'joi';

export default Joi.object({
    business_date: Joi.date().min('now').raw().required()
});