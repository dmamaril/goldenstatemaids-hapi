import createCustomer   from './createCustomer';
// import updateCustomer   from 'updateCustomer';
// import deleteCustomer   from 'deleteCustomer';
// import getCustomer      from 'getCustomer';

export default (firebase) => [
    createCustomer(firebase)
];