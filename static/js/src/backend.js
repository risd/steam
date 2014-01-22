var config = require('./config')(location.hostname);

module.exports = Backend;

function Backend () {

    var api = {};

    api.base = config.backend_url;

    api.api_url = config.backend_url + '/api/' + config.version;

    api.steamie = api.api_url + '/steamie/?format=json';
    api.geo = api.api_url + '/geo/?format=json';
    api.network = api.api_url + '/network/?format=json';

    api.steamie_user = function (x) {
        return api.api_url + '/steamie/' + x + '/?format=json';
    };

    api.steamie_request = function (data_to_submit, callback) {
        var csrf_token = get_cookie('csrftoken');

        console.log('url');
        console.log(api.steamie);
        // api.steamie
        // 'http://0.0.0.0:5000/api/v1/steamie/'
        var xhr = d3.xhr(api.steamie)
            .mimeType('application/json')
            .header('X-CSRFToken', csrf_token)
            .header('Content-type', 'application/json')
            .send('PUT',
                  JSON.stringify(data_to_submit),
                  callback);
    };

    api.steamie_update = function (args, callback) {
        var csrf_token = get_cookie('csrftoken');

        console.log('url');
        console.log(api.steamie);

        var xhr = d3.xhr(api.steamie_user(args.steamie_id))
            .mimeType('application/json')
            .header('X-CSRFToken', csrf_token)
            .header('Content-type', 'application/json')
            .send('PATCH',
                  JSON.stringify(args.data_to_submit),
                  callback);
    };

    function get_cookie (c_name) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        return c_value;
    }

    return api;
}