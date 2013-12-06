var config = require('./config')(location.hostname);

module.exports = Backend;

function Backend () {

    var api = config.backend_url + '/api/' + config.version;

    return {
        base: config.backend_url,
        steamie: api + '/steamie/?format=json',
        geo: api + '/geo/?format=json',
        network: api + '/network/?format=json'
    };
}