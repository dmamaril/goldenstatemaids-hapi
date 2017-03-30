var Hapi                    = require('hapi');
var stripe                  = require('stripe')(process.env.STRIPE_SECRET);
var createCustomerHandler   = require('./lib/createCustomerHandler.js');

var server = new Hapi.Server();

server.connection({ port: ~~process.env.PORT, host: '0.0.0.0', routes: { cors: true } });

server.route({
    method: 'GET',
    path: '/',
    handler: (request, reply) => reply('OK')
});

server.route({
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    method: 'POST',
    path: '/charge',
    handler: chargeHandler
});


server.route({
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    method: 'POST',
    path: '/createCustomer',
    handler: createCustomerHandler
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
 * @param  {[type]} request [description]
 * @param  {[type]} reply   [description]
 * @return {[type]}         [description]
 */
function chargeHandler(request, reply) {
    reply('EMPTY ROUTE');
}