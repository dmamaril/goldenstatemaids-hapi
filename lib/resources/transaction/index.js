import createTransaction   from './createTransaction';
// import updateCustomer   from './updateCustomer';
// import deleteCustomer   from './deleteCustomer';
// import getCustomer      from './getCustomer';

export default (firebase) => [
    createTransaction(firebase),
    // updateCustomer(firebase)
];