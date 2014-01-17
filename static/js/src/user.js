module.exports = User;

function User (context) {
    var user = {},
        authed,   // true/false
        data,     // obj response from server
        dispatch = user.dispatch = d3.dispatch('checkAuthComplete');

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

            data = data_response;
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
        // probably don't want to overwrite the
        // data object. may remove it.
        // more of a getter to check state.
        // specific useful functions for the user
        // are below.
        data = x;
        return user;
    };

    // --------
    // specific attributes to over write
    var steamie_type;

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
        if (!arguments.length) return top_level_input;
        data.objects[0].top_level_input = x;
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