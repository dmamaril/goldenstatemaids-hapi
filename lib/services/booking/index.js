export default (server, firebase) => {

    const method    = 'POST';
    const path      = '/services/booking';
    const config    = {};

    /**
     * [description]
     *
     * http://stackoverflow.com/questions/33069573/call-a-hapi-route-from-another-route
     * 
     * @param  {[type]} request [description]
     * @param  {[type]} reply   [description]
     * @return {[type]}         [description]
     */
    const handler = (request, reply) => {

    };


    return { path, method, handler, config };
};