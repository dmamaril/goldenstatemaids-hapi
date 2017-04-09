import Joi          from 'joi';
import Boom         from 'boom';
import JVPatch      from 'joi-validate-patch';
import schema       from './schema';
import encodeEmail  from '../utils/encodeEmail';

export default (firebase) => {

    const method    = 'PATCH';
    const path      = '/customer/{email}'
    const rootRef   = 'customer_proto';

    const patchSchema = Joi.object({
        value   : Joi.any().required(),
        path    : Joi.string().required(),
        op      : Joi.string().valid('replace', 'remove', 'add').required()
    });

    const config = {
        validate: {
            params: {
                email: Joi.string().email()
            },
            payload: Joi.array().items(patchSchema.required()).min(1)
        }
    };

    /**
     * [description]
     *
     * JSON Patch Standards
     * https://tools.ietf.org/html/rfc6902
     *
     * [
     *     {
     *         "path": "/path/to/field",
     *         "value": "new_value",
     *         "op": "replace/add/remove"
     *     }
     * ]
     *
     * On validating patch paylaods against a schema;
     * https://github.com/MarkHerhold/json-patch-joi
     * https://www.npmjs.com/package/joi-validate-patch
     * 
     * On prpoerly handling validation errors
     * http://stackoverflow.com/questions/32897719/how-to-avoid-hapi-js-sending-400-error-when-validating-request-with-joi
     * 
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

        let payload = request.payload;

        try {

            // JVPatch blowing up on bad paths
            const { error, value } = JVPatch.validate(payload, schema);

            if (error) {
                return reply(Boom.badData(error));
            }


        } catch (e) {

            reply(Boom.badData());
        }
    };

    return { path, method, handler, config };    
};