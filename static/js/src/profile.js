var Individual = require('./profile_individual'),
    Institution = require('./profile_institution'),
    Settings = require('./profile_settings');

module.exports = function Profile (context) {
    var self = {},
        geo_options,
        profile,
        type,
        built = false;

    self.built = function (x) {
        // tell the world whether or not
        // this jam has been built
        if (!arguments.length) return built;
        built = x;
        return self;
    };

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.build = function () {
        type = context.user.type();

        if ( type === 'individual') {
            profile = Individual(context)
                .selection(d3.select('#profile-individual'))
                .geoOptions(geo_options)
                .data(context.user.data())
                .build();

        } else if (type === 'institution') {
            profile = Institution(context)
                .selection(d3.select('#profile-institution'))
                .geoOptions(geo_options)
                .data(context.user.data())
                .build();
        } else {
            return self.built(false);
        }

        set_modal_color();

        profile.selection()
                .append('div')
                .attr('class', 'four-column-four')
                .append('p')
                .attr('class', 'large button')
                .text('Sign out.')
                .on('click', function () {

                    context.api.logout(function (err, response) {
                        if (err) {
                            // how do you tell a user that the
                            // logout wasnt complete?
                            console.log('could not log out');
                            console.log(err);
                            return;
                        }

                        console.log('logged out, now what?');
                        console.log(response);

                        context.modal_flow
                            .state('just_logged_out');
                    });
                });

        profile.work_in.dispatch
            .on('valueChange.profile', function () {
                set_modal_color();
            });

        self.built(true);

        return self;
    };

    function set_modal_color () {
        profile.work_in.data().forEach(function (d, i) {
            context.modal_flow
                .el
                .display
                .modal
                .el
                .classed(d.value, d.selected);
        });
    }

    return self;
};