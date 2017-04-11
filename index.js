import Hapi         from 'hapi';
import firebase     from 'firebase';
import stripePkg    from 'stripe';

import customer     from './lib/resources/customer';
import booking      from './lib/resources/booking';
import transaction  from './lib/resources/transaction';

import availabilityService from './lib/services/availability';

require('dotenv').config();

// INITIALIZE FIREBASE;
firebase.initializeApp({
    apiKey             : process.env.FIREBASE_API_KEY,
    authDomain         : process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL        : process.env.FIREBASE_DATABASE_URL,
    storageBucket      : process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId  : process.env.FIREBASE_MESSAGING_SENDER_ID
});

// INITIALIZE STRIPE
const stripe = stripePkg(process.env.STRIPE_SECRET);

// INITIALIZE SERVER;
const server = new Hapi.Server();

const connection = {
    port: ~~process.env.PORT,
    host: '0.0.0.0',
    routes: {
        cors: true
    }
};

const baseRoute = {
    path    : '/',
    method  : 'GET',
    handler : (req, rep) => rep('OK').code(200)
};

const start = (err) => {
    if (err) throw err;
    console.log(`Server running at: ${server.info.uri}`);
};

const defaultConfig = {
    cors: {
        origin: ['*'],
        additionalHeaders: ['cache-control', 'x-requested-with']
    }
};

// INITIALIZE CUSTOM ROUTES;
const routes = [].concat(

    // load resources;
    customer(firebase),
    booking(firebase),
    transaction(firebase),

    // load services;
    availabilityService(server, firebase)
);

server.connection(connection);
server.route(baseRoute);

routes.forEach((route) => {
    // extend cfg with defualts
    route.config = { ...defaultConfig, ...route.config };
    // intiialize route;
    server.route(route);
});

// START SERVER;
server.start(start);