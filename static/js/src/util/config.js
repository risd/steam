module.exports = Config;

function Config (hostname) {
    var local = (hostname === 'localhost');

    return {
        backend_url: local ?
            'http://localhost:5000' :
            'http://map.stemtosteam.org',

        version: 'v1'
    };
}