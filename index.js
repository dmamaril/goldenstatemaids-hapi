process.env.STRIPE_SECRET = 'sk_test_5MiasKiLzMrzGyMbgNfuNEXN';

var Hapi    = require('hapi');
var server  = new Hapi.Server();
var stripe  = require('stripe')(process.env.STRIPE_SECRET);

server.connection({ port: 3000, host: 'localhost', routes: { cors: true } });

server.route({
    method: 'POST',
    path: '/charge',
    handler: chargeHandler
});

server.start(function (err){

    if (err) {
        throw err;
    }

    console.log(`Server running at: ${server.info.uri}`);
});

/**
 * [chargeHandler description]
 *
 *  {
 *      amount: 1000, // $10.00
 *      currency: 'usd',
 *      capture: true,
 *      description: 'Home cleaning on March 8th, 2017',
 *      metadata: {
 *          email: 'mamarildon@gmail.com',
 *          orderDetails: { ... }
 *      },
 *      source: Stripe.token
 *  }
 *
 * 
 * @param  {[type]} request [description]
 * @param  {[type]} reply   [description]
 * @return {[type]}         [description]
 */
function chargeHandler(request, reply) {

    var amount      = request.payload.amount;
    var source      = request.payload.source;
    var description = request.payload.description;
    var metadata    = request.payload.metadata;

    stripe.charges.create(

        {
            currency    : 'usd',
            amount      : amount,
            source      : source,
            metadata    : metadata,
            description : description,
        },

        function (err, res) {

            console.log('ERR >>', err);
            console.log('');
            console.log(res);

            reply(err || res);
        }
    );
}