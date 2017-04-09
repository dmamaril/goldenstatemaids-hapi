import Joi          from 'joi';
import Boom         from 'boom';
import schema       from './schema';

export default (firebase) => {

    const method    = 'POST';
    const path      = '/booking';
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
        let ref     = firebase.database().ref(rootRef).child(bizDate);

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
                    let conflicting = booking.start_time <= payload.start_time ||
                                      booking.end_time >= payload.end_time;

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
            ref.push(payload)
                .then(resolve)
                .catch(() => reject(Boom.serviceUnavailable()));
        });

        /**
         * [description]
         *
         *  ss.key to retrieve auto generated fb key
         * 
         * @param  {[type]} ss [description]
         * @return {[type]}    [description]
         */
        const sendBookingLocation = (ss) => {

            let location = [rootRef, bizDate, ss.key].join('/');

            reply({ location }).code(201);
        };

        checkConflict()
            .then(createBooking)
            .then(sendBookingLocation)
            .catch(reply);
    };

    return { path, method, handler, config };
};