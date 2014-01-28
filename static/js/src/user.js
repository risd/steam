var profile = require('./profile');

module.exports = User;

function User (context) {
    var user = {},
        authed,   // true/false
        data,     // obj response from server
        dispatch = user.dispatch = d3.dispatch('checkAuthComplete');

    // --------
    // steam specific variables
    var steamie_type;

    user.check_auth = function () {
        // checks the server to see if user
        // is authenticated
        // depending on response, sets state
        // of the form.

        var url = context.api.steamie;

        d3.json(url, function (err, data_response) {
            console.log('auth check');
            console.log(data_response);
            if ((err) ||
                (typeof(data_response) === 'undefined') ||
                (data_response.meta.total_count === 0)) {
                // not auth'ed
                console.log('Not authed.');
                data = null;
                authed = false;
            } else {
                user.data(data_response);
                authed = true;
            }

            dispatch.checkAuthComplete.apply(this, arguments);
        });

        return user;
    };

    user.authed = function (x) {
        if (!arguments.length) return authed;
        authed = x;
        return user;
    };

    // status is the response from the server
    // about the user's authentication
    user.data = function (x) {
        if (!arguments.length) return data;
        if ('objects' in x) {
            data = x.objects[0];
        } else {
            data = x;
        }
        return user;
    };

    user.setTypeDefaults = function () {
        if (steamie_type === 'individual') {

            // defaults for an individual
            user.individual({
                first_name: null,
                last_name: null,
                email: null,
                url: null,
                institution: null,
                title: null,
                email_subscription: false
            });
        }
        else if (steamie_type === 'institution') {

            // defaults for an institution
            user.institution({
                name: null,
                url: null,
                representative_first_name: null,
                representative_last_name: null,
                representative_email: null
            });
        }

        return user;
    };

    // --------
    // steam specific functions

    user.profile = profile(context);

    if (context.countries.data()) {
        // if the data is loaded already,
        // populate the user profile
        user.profile
            .geoOptions(context.countries.data());
    } else {
        // wait until it is loaded, and then
        // render based on results
        context.countries.dispatch.on('loaded', function () {
            user.profile
                .geoOptions(context.countries.data());
        });
    }

    user.zip_code = function (x) {
        if (!arguments.length) return data.zip_code;
        data.zip_code = x;
        return user;
    };

    user.avatar_url = function () {
        return data.avatar_url;
    };

    user.type = function (x) {
        if (!arguments.length) return steamie_type;
        steamie_type = x;
        return user;
    };

    // steamie_geo will go to the server and be
    // saved as part of the user's profile
    // top_level_input = steamie_geo
    user.top_level_input = function (x) {
        if (!arguments.length) return data.top_level_input;
        data.top_level_input = x;
        return user;
    };

    user.work_in = function (x) {
        if (!arguments.length) return data.work_in;
        data.work_in = x;
        return user;
    };

    user.individual = function (x) {
        if (!arguments.length) return data.individual;
        data.individual = x;
        return user;
    };

    user.institution = function (x) {
        if (!arguments.length) return data.institution;
        data.institution = x;
        return user;
    };

    return user;
}