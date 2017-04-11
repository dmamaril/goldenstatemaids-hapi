// import createBooking   from './createBooking';
// import updateBooking   from './updateBooking';
// import deleteBooking   from './deleteBooking';
import getTeam      from './getTeam';

export default (firebase) => [
    getTeam(firebase)
];