/**
 * [description]
 *
 * https://groups.google.com/forum/#!topic/firebase-talk/vtX8lfxxShk
 * 
 * @param  {[type]} email [description]
 * @return {[type]}       [description]
 */
export default (email) => {

    if (typeof email !== 'string') {
        return email;
    }

    return encodeURIComponent(email).replace('.', '%2E');
};