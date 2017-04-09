import Joi          from 'joi';
import Boom         from 'boom';
import schema       from './schema';
import encodeEmail  from '../utils/encodeEmail';

export default (firebase) => {

    const method    = `POST`;
    const path      = `/customers`;
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
        let ref     = firebase.database().ref(`customers_proto`).child(key);

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
            ref.set(payload)
                .then(resolve)
                .catch(() => reject(Boom.serviceUnavailable()))
        });

        /**
         * [description]
         * @param  {[type]} ss [description]
         * @return {[type]}    [description]
         */
        const customerCreated = (ss) => {
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