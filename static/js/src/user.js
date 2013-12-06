module.exports = User;

function User (context) {
    var user = {},
        authed,   // true/false
        uid;      // user id

    user.check_auth = function () {
        // checks the server to see if user
        // is authenticated
        // depending on response, sets state
        // of the form.

        var url = context.api.steamie;

        d3.json(url, function (err, status) {
            if (err) {
                // not auth'ed
                console.log('Not authed.');

                return;
            }

            // if call comes back without err,
            // then the user is authenticated.
            user.authed(true);

            // status.objects[0] is the result you
            // are after.

            if (status.objects[0].individual) {
                if (status.objects[0].individual.zip_code) {
                    // already on map
                    // form.state('profile');

                    // for now
                    context.form.type('individual')
                        .state('inactive');
                } else {
                    // not on map, fill it out
                    context.form.type('individual')
                        .state('fill_out_individual');
                }

            } else if (status.objects[0].institution) {
                context.form.type('institution')
                    .state('fill_out_institution');

            } else {
                context.form.state('fill_out_' + context.form.type());
            }

            context.form.add_avatar(status.objects[0].avatar_url);


        });

        return user;
    };

    user.authed = function (x) {
        if (!arguments.length) return authed;
        authed = x;
        return user;
    };

    return user;
}