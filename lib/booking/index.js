import createBooking   from './createBooking';
// import updateBooking   from 'updateBooking';
// import deleteBooking   from 'deleteBooking';
// import getBooking      from 'getBooking';

export default (firebase) => [
    createBooking(firebase)
];