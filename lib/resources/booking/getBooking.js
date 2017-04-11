import Joi from 'joi';
import Boom from 'boom';

export default (firebase) => {

    const method    = 'GET';
    const path      = '/resources/booking/{business_date?}';
    const rootRef   = 'booking_proto';
    const config    = {
        validate: {
            params: {
                business_date: Joi.date().iso().raw()
            }
        }
    };

    /**
     * [description]
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

        let { business_date } = request.params;

        let key;

        if (business_date) {
            key = business_date.slice(0, business_date.indexOf('T'));
        }

        let ref = firebase.database().ref(rootRef);

        if (key) {
            ref = ref.child(key);
        }

        ref.once('value')
            .then((ss) => reply(ss.val() || {}).code(200))
            .catch(() => reply(Boom.serviceUnavailable()));
    };

    return { path, method, handler, config };
};