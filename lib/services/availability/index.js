import _ from 'lodash';
import Boom from 'Boom';
import schema from './schema';

export default (server, firebase) => {

    const method    = 'POST';
    const path      = '/services/availability';
    const rootRef   = 'booking_proto';
    const config    = { validate: { payload: schema } };

    /**
     * [description]
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

        const START_TIME    = 830;
        const START_TIMES   = [830, 1030, 1230, 1430, 1630];
        const base_url      = [server.info.uri, 'resources'].join('/');

        /**
         * [description]
         * @param  {Function} )   [description]
         * @param  {[type]}   ({ statusCode,   result } [description]
         * @return {[type]}       [description]
         */
        const getTeams = () => new Promise((resolve, reject) => {

            let url     = [base_url, 'team'].join('/');
            let method  = 'GET';

            /**
             * [description]
             * @param  {[type]} options.method [description]
             * @param  {[type]} options.url    [description]
             * @param  {[type]} ({            statusCode,   result } [description]
             * @return {[type]}                [description]
             */
            server.inject({ method, url }, ({ statusCode, result }) => {

                if (statusCode !== 200) {
                    return reject(Boomm.notFound());
                }

                let teams = { length: 0 };

                for (let email in result) {

                    email = decodeURIComponent(email);

                    teams[email] = 1;
                    teams.length++;                    
                }

                resolve(teams);
            });
        });

        /**
         * [description]
         * @param  {Function} )   [description]
         * @param  {[type]}   ({ statusCode,   result } [description]
         * @return {[type]}       [description]
         */
        const getBookings = (teams) => new Promise((resolve, reject) => {

            let bizDate = request.payload.business_date;
            let url     = [base_url, 'booking', bizDate].join('/');
            let method  = 'GET';

            /**
             * [description]
             *
             *  result is an obj;
             *  {
             *      [key]: { booking }
             *  }
             * 
             * @param  {[type]} options.method [description]
             * @param  {[type]} options.url    [description]
             * @param  {[type]} ({            statusCode,   result } [description]
             * @return {[type]}                [description]
             */
            server.inject({ method, url }, ({ statusCode, result }) => {

                let bookings = result;

                statusCode === 200 ? resolve({ teams, bookings }) : reject(Boom.notFound());
            });
        });


        /**
         * [description]
         * @param  {[type]} start_time [description]
         * @return {[type]}            [description]
         */
        const createAvailability = (start_time, open_teams) => {

            start_time = start_time.toString();

            let min = start_time.slice(-2);
            let hr  = (start_time.length === 3 ? start_time[0] : start_time.slice(0, 2));

            // convert type to int;
            min         = Number(min);
            hr          = Number(hr);
            start_time  = Number(start_time);

            let min_display     = (min ? min : '00');
            let hr_display      = (hr <= 12 ? hr : hr - 12);
            let display_text    = [hr_display, min_display].join(':');

            display_text += (hr < 12 ? ' AM' : ' PM');

            if (hr !== 8) {

                let end_hr          = hr + 2;
                let end_hr_display  = (end_hr <= 12 ? end_hr : end_hr - 12);
                let end_time        = [end_hr_display, min_display].join(':');

                display_text += ' - ' + end_time;
                display_text += (end_hr < 12 ? ' AM' : ' PM');
            }

            return ({ start_time, display_text, open_teams });
        };

        /**
         * [createAvailabilities description]
         *
         *  where bookings is an array of existing bookings for the given date
         *  keep in mind that you have multiple teams,
         *  therefore if a booking exists only for 1 team, 
         *  the slot should still be available.
         *
         * determine what timeslots are available based on booking start_time & end_time
         * 830-1030 is the default starting time
         * last job should start no later than 430
         *
         * start_times: [830, 1030, 1230, 1430, 1630]
         * 
         * @param  {[type]} bookings [description]
         * @return {[type]}          [description]
         */
        const createAvailabilities = ({ teams, bookings }) => {

            let results     = [];
            let timeslots   = {};

            bookings = _.values(bookings);
            bookings = _.groupBy(bookings, 'start_time');

            for (let i = 0 ; i < START_TIMES.length ; i++) {

                let start_time          = START_TIMES[i];
                let current_bookings    = bookings[start_time] || [];
                let n_bookings          = current_bookings.length;
                let open_teams          = _.cloneDeep(teams);

                // remove len prop from clone;
                delete open_teams.length;

                // check end time; if it overlaps with any of the existing start_times,
                // push a phantom booking for that timeslot;
                for (let booking of current_bookings) {

                    let { end_time, team_key }  = booking;
                    let next_start              = START_TIMES[i+1];

                    // remove booked team from clone;
                    delete open_teams[team_key];

                    if (next_start && end_time > next_start) {
                        bookings[next_start] = bookings[next_start] || [];
                        bookings[next_start].push({ start_time, end_time });
                    }
                }

                // if all teams are booked
                if (n_bookings >= teams.length) {
                    continue;
                }

                open_teams = _.keys(open_teams);
                results.push(createAvailability(start_time, open_teams));
            }

            return results.length ? results : [{ display_text: 'Fully Booked' }];
        };



        // main;
        getTeams()
            .then(getBookings)
            .then(createAvailabilities)
            .then((d) => reply(d).code(200))
            .catch(reply);
    };


    return { path, method, handler, config };
};