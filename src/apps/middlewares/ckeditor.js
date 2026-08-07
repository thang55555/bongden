const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    dest: `${__dirname}/../../tmp`,
});
module.exports = multipartMiddleware; 