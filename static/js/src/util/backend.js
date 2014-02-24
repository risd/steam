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

    api.toplevelgeo_url = function (tlg_id) {
        return api.api_url + '/toplevelgeo/' +
               tlg_id + '/?format=json';
    };

    api.network_steamies_url = function (args) {
        // args - .tlg_id, .offset
        return api.api_url +
            '/network/' + args.tlg_id +
            '/?format=json' +
            (args.offset ? ('&offset=' + args.offset) : '');
    };

    api.logout = function (callback) {
        d3.json(api.base + '/map/logout/', callback);
    };

    api.network_steamies_request = function (args, callback) {
        // args - .tlg_id, .offset
        console.log('network request');
        console.log('url: ', api.network_steamies_url(args));
        var request = d3.json(api.network_steamies_url(args),
                              callback);
        return request;
    };

    api.toplevelgeo_request = function (tlg_id, callback) {
        var request = d3.json(api.toplevelgeo_url(tlg_id), callback);
        return request;
    };

    api.steamie_update = function (data_to_submit, callback) {
        var csrf_token = get_cookie('csrftoken');

        console.log('data');
        console.log(data_to_submit);
        console.log('url');
        console.log(api.steamie_user(data_to_submit.id));

        // submit this data against the steamie endpoint
        var xhr = d3.xhr(api.steamie_user(data_to_submit.id))
            .mimeType('application/json')
            .header('X-CSRFToken', csrf_token)
            .header('Content-type', 'application/json')
            .send('PATCH',
                  JSON.stringify(data_to_submit),
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