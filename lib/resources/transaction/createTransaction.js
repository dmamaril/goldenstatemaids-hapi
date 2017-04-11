import Joi          from 'joi';
import Boom         from 'boom';
import schema       from './schema';
import encodeEmail  from '../../utils/encodeEmail';

export default (firebase) => {

    const method    = 'POST';
    const path      = '/resources/transaction';
    const rootRef   = 'transaction';
    const config    = { validate: { payload: schema } };

    /**
     * [description]
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

        let payload = request.payload;
        let key     = payload.booking_id;
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
         * @param  {[type]} ) [description]
         * @return {[type]}   [description]
         */
        const validateCoupon = () => new Promise((resolve, reject) => {

            let { coupon, coupon_discount } = payload.initial_cost;

            if (!coupon) {
                return !coupon_discount ? resolve() : reject(Boom.badData(`Coupon discount of ${coupon_discount} found without valid coupon.`));
            }

            let ref = firebase.database().ref('coupon').child(coupon);

            ref.once('value', (ss) => {

                let couponRecord = ss.val();

                if (!couponRecord) {
                    return reject(Boom.badData(`Coupon: ${ coupon } not found.`));
                }

                let {
                    code,
                    limit,
                    discount,
                    num_used,
                    expiration_date } = couponRecord;

                let epoch_now   = new Date().getTime();
                let exp_epoch   = new Date(expiration_date).getTime();

                if (epoch_now > exp_epoch) {
                    return reject(Boom.badData(`Coupon: ${ code } has expired on ${ expiration_date }.`));
                }

                if ((typeof limit === 'number' && typeof num_used === 'number') && (num_used >= limit)) {
                    return reject(Boom.badData(`Coupon: ${ code } is no longer valid.`));
                }

                return resolve();
            });
        });

        /**
         * [description]
         * @return {[type]} [description]
         */
        const createTransaction = () => new Promise((resolve, reject) => {

            payload.sys_created_at = new Date().toISOString();

            ref.set(payload)
                .then(resolve)
                .catch(() => reject(Boom.serviceUnavailable()))
        });

        /**
         * [description]
         * @return {[type]} [description]
         */
        const transactionCreated = () => {
            reply().code(201);
        };

        // main;
        checkConflict()
            .then(validateCoupon)
            .then(createTransaction)
            .then(transactionCreated)
            .catch(reply);
    };

    return { path, method, handler, config };
};