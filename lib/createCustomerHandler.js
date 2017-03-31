var q           = require('q');
var _           = require('lodash');
var firebase    = require('firebase');

var cfg = {
    apiKey             : process.env.FIREBASE_API_KEY,
    authDomain         : process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL        : process.env.FIREBASE_DATABASE_URL,
    storageBucket      : process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId  : process.env.FIREBASE_MESSAGING_SENDER_ID
};

console.log('## INITIALIZING FIREBASE');

firebase.initializeApp(cfg);

/**
 * [exports description]
 * @param  {[type]} request [description]
 * @param  {[type]} reply   [description]
 * @return {[type]}         [description]
 */
module.exports = function createCustomerHandler(request, reply) {

    var payload = request.payload;
    var email   = payload.email;

    console.log('');
    console.log('## CREATE CUSTOMER HANDLER');

    var key = encodeURIComponent(email).replace('.', '%2E');
    var ref = firebase.database().ref('customers/' + key);

    console.log('## Setting firebase key:', key);

    ref.once('value', function (ss) {

        var customer = ss.val();

        console.log('## Result:');
        console.log(customer);
        console.log();

        if (!customer) {

            createCustomer(payload).then(onSuccess).catch(onFail);

        } else {

            customer = _.values(customer)[0];
            scheduleCharge(customer.id, payload).then(onSuccess).catch(onFail);
        }

    });

    function onSuccess(data) {

        console.log('## RESULT: SUCCESS');
        console.log(data);

        reply({ data: data }).code(201);
    }

    function onFail(data) {

        console.log('## RESULT: FAIL');
        console.log(data);

        reply({ data: data.message }).code(400);
    }
}

/**
 * [createCustomer description]
 * @param  {[type]} payload [description]
 * @return {[type]}          [description]
 */
function createCustomer(payload) {

    var deferred = q.defer();
    var customer = _.pick(payload, ['email', 'source', 'description']);

    console.log('## CREATING STRIPE CUSTOMER');
    console.log(customer);

    stripe.customers
        .create(customer)
        .then(saveCustomer)
        .then(saveStripeCharge)
        .catch(deferred.reject);

    /**
     * [saveCustomer description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function saveCustomer(data) {

        console.log('## STRIPE CUSTOMER SUCCESS');
        console.log('## SAVING CUSTOMER', customer.email);
        console.log(data);
        console.log();

        var key = encodeURIComponent(customer.email).replace('.', '%2E');
        var ref = firebase.database().ref('customers/' + key);

        ref.push(data, function (err) {
            err ? deferred.reject(err) : deferred.resolve(data);
        });
    }

    /**
     * [saveStripeCharge description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    function saveStripeCharge(data) {
        return scheduleCharge(data.id, payload)
    }


    return deferred.promise;
}

/**
 * [scheduleCharge description]
 * @param  {[type]} customerId [description]
 * @param  {[type]} data       [description]
 * @return {[type]}            [description]
 */
function scheduleCharge(customerId, data) {

    var deferred = q.defer();

    var key = ['chargeSchedule', customerId, data.booking.service_date].join('/');
    var ref = firebase.database().ref(key);

    console.log('## SCHEDULING CHARGE FOR', customerId, key);

    ref
        .push(data)
        .then(onScheduleSuccess)
        .catch(deferred.reject);

    /**
     * [onScheduleSuccess description]
     *
     *  Attach firebase key as confirmation #;
     * 
     * @param  {[type]} ss [description]
     * @return {[type]}    [description]
     */
    function onScheduleSuccess(ss) {

        let key = ss.key;
        deferred.resolve({ key });
    }


    return deferred.promise;
}