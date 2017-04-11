import Joi from 'joi';
import Boom from 'boom';
import encodeEmail from '../../utils/encodeEmail';

export default (firebase) => {

    const method    = 'GET';
    const path      = '/resources/team/{email?}';
    const rootRef   = 'teams';
    const config    = {
        validate: {
            params: {
                email: Joi.string().email()
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

        let ref     = firebase.database().ref(rootRef);
        let email   = encodeEmail(request.params.email);

        if (email) {
            ref = ref.child(email);
        }

        ref.once('value')
            .then((ss) => reply(ss.val() || {}).code(200))
            .catch(() => reply(Boom.serviceUnavailable()));
    };

    return { path, method, handler, config };
};