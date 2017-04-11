import Joi          from 'joi';
import Boom         from 'boom';
import schema       from './schema';
import encodeEmail  from '../../utils/encodeEmail';

export default (firebase) => {

    const method    = 'POST';
    const path      = '/resources/customer';
    const rootRef   = 'customer_proto';
    const config    = { validate: { payload: schema } };
    /**
     * [description]
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

        let payload = request.payload;
        let email   = payload.email;

        let key     = encodeEmail(email);
        let ref     = firebase.database().ref(rootRef).child(key);

        /**
         * [description]
         * @return {[type]} [description]
         */
        const checkConflict = () => new Promise((resolve, reject) => {
            ref.once('value', (ss) => {
                ss.val() ? reject(Boom.conflict()) : resolve();
            });
        });

        /**
         * [description]
         * @return {[type]} [description]
         */
        const createCustomer = () => new Promise((resolve, reject) => {

            payload.sys_created_at = new Date().toISOString();

            ref.set(payload)
                .then(resolve)
                .catch(() => reject(Boom.serviceUnavailable()))
        });

        /**
         * [description]
         * @return {[type]} [description]
         */
        const customerCreated = () => {
            reply().code(201);
        };

        // main;
        checkConflict()
            .then(createCustomer)
            .then(customerCreated)
            .catch(reply);
    };

    return { path, method, handler, config };
};