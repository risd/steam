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
            if (err) {
                // not auth'ed
                console.log('Not authed.');
                data = undefined;
                authed = false;
                return;
            }

            user.data(data_response);
            authed = true;

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
        data = x;

        // steamie_type is otherwise set by
        // the modal form, so it should be
        // set and realiable when data is
        // coming in, too.
        if (data.objects[0].individual) {
            user.type('individual');
        } else if (data.objects[0].institution) {
            user.type('institution');
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
            .geoOptions(context.countries.data())
            .build();
    } else {
        // wait until it is loaded, and then
        // render based on results
        context.countries.dispatch.on('loaded', function () {
            user.profile
                .geoOptions(context.countries.data())
                .build();
        });
    }

    user.zip_code = function (x) {
        if (!arguments.length) return data.objects[0].zip_code;
        data.objects[0].zip_code = x;
        return user;
    };

    user.avatar_url = function () {
        return data.objects[0].avatar_url;
    };

    // type only affects the UI.
    // does not change the actual data structure
    // that is going to and from the server
    user.type = function (x) {
        if (!arguments.length) return steamie_type;
        if ((x.toLowerCase() === 'individual') ||
            (x === 'i')) {
            steamie_type = 'individual';
        }
        else if ((x.toLowerCase() === 'institution') ||
                 (x === 'g')) {
            steamie_type = 'institution';
        }

        return user;
    };

    // steamie_geo will go to the server and be
    // saved as part of the user's profile
    // top_level_input = steamie_geo
    user.top_level_input = function (x) {
        if (!arguments.length) return data.objects[0].top_level_input;
        data.objects[0].top_level_input = x;
        return user;
    };

    user.work_in = function (x) {
        if (!arguments.length) return data.objects[0].work_in;
        data.objects[0].work_in = x;
        return user;
    };

    user.individual = function (x) {
        if (!arguments.length) return data.objects[0].individual;
        data.objects[0].individual = x;
        return user;
    };

    user.institution = function (x) {
        if (!arguments.length) return data.objects[0].institution;
        data.objects[0].institution = x;
        return user;
    };

    return user;
}