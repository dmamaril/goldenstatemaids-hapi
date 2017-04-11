import Boom         from 'boom';
import schema       from './schema';

export default (firebase) => {

    const method    = 'POST';
    const path      = '/resources/booking';
    const rootRef   = 'booking_proto';
    const config    = { validate: { payload: schema } };
    /**
     * [description]
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

        let payload = request.payload;
        let bizDate = payload.business_date;
        let ref     = firebase.database().ref(rootRef).child(bizDate.slice(0, bizDate.indexOf('T')));

        /**
         * [description]
         * @param  {Function} ) [description]
         * @return {[type]}     [description]
         */
        const checkConflict = () => new Promise((resolve, reject) => {
            ref.once('value', (ss) => {

                let bookings = ss.val();

                if (!bookings) {
                    return resolve();
                }

                for (let key in bookings) {

                    let booking = bookings[key];

                    // if theres a booking within the range of the current start & end
                    let conflicting = (booking.start_time <= payload.start_time && booking.start_time >= payload.end_time) ||
                                      (booking.end_time >= payload.end_time && booking.end_time <= payload.start_time);

                    if (conflicting) {
                        return reject(Boom.conflict(`${payload.start_time} slot is no longer available for ${bizDate}.`));
                    }
                }

                resolve();
            });
        });

        /**
         * [description]
         * @param  {Function} ) [description]
         * @return {[type]}     [description]
         */
        const createBooking = () => new Promise((resolve, reject) => {

            let refKey = ref.push().key;

            payload.sys_transaction_id  = refKey;
            payload.sys_created_at      = new Date().toISOString();

            ref.child(refKey)
                .set(payload)
                .then(resolve.bind(null, refKey))
                .catch((e) => reject(Boom.serviceUnavailable(e)));
        });

        /**
         * [description]
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        const sendBookingLocation = (key) => {

            let location = [rootRef, bizDate, key].join('/');

            reply({ location }).code(201);
        };

        checkConflict()
            .then(createBooking)
            .then(sendBookingLocation)
            .catch(reply);
    };

    return { path, method, handler, config };
};