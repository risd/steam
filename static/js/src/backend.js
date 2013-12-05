var config = require('./config')(location.hostname);

module.exports = Backend;

function Backend (config) {

    var base = config.backend_url + '/api/' + config.version;

    return {
        steamie: base + '/steamie/?format=json',
        geo: base + '/geo/?format=json',
        network: base + '/network/?format=json'
    };
}