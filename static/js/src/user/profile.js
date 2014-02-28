var Individual = require('./profile_individual'),
    Institution = require('./profile_institution'),
    Settings = require('./profile_settings'),
    validatableManager =
        require('./validatableManager');

module.exports = function Profile (context) {
    var self = {},
        geo_options,
        profile,
        type,
        built = false,
        prev_valid,
        valid,
        save_button,
        validatable = validatableManager();

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

    self.remove = function () {
        self.built(false);
        reset_modal_color();
        profile.selection().html('');
    };

    self.build = function () {

        type = context.user.type();

        if ( type === 'individual') {
            profile = Individual(context)
                .selection(d3.select('#profile-individual'))
                .geoOptions(geo_options)
                .data(context.user.data());

        } else if (type === 'institution') {
            profile = Institution(context)
                .selection(d3.select('#profile-institution'))
                .geoOptions(geo_options)
                .data(context.user.data());

        } else {
            return self.built(false);
        }

        // set validator
        profile.validate = validate;
        profile.build();

        // common components that must
        // be valid to submit
        validatable.batchAdd([{
            isValid: profile.work_in.isValid,
        }, {
            isValid: profile.geo.isValid
        }, {
            isValid: profile.required_name.valid
        }]);

        set_modal_color();

        // add save button
        save_button = profile.selection()
            .append('div')
            .attr('class', 'four-column-one')
            .append('p')
            .attr('class', 'save-button')
            .text('Save');

        // add find me button
        var find_me = profile.selection()
            .append('div')
            .attr('class', 'four-column-two ' +
                           'find-me-button')
            .on('click', function () {
                context.modal_flow
                    .state('inactive_with_profile');
                    
                var d = context.user.data(),
                    type  = context.user.type();

                // move the map
                var sw = L.latLng(
                        d.top_level.miny,
                        d.top_level.minx),

                    ne = L.latLng(
                        d.top_level.maxy,
                        d.top_level.maxx);

                context.map.fitBounds(L.latLngBounds(sw, ne));

                context.network
                    .highlight({
                        tlg_id: d.top_level.id,
                        steamie_type: type,
                        steamie_id: d[type].id,
                        steamie: [d]
                    });
            });

        find_me
            .append('p')
            .attr('class', 'find-me')
            .text('Locate Me');

        // add a sign out button
        var sign_out = profile.selection()
                .append('div')
                .attr('class',
                      'logout-button four-column-one omega');
        sign_out
            .append('p')
            .attr('class', '')
            .text('Sign Out')
            .on('click', function () {
                context.modal_flow
                    .state('logging_out');
                context.api.logout(function (err, response) {
                    if (err) {
                        context.modal_flow
                            .state('profile_' +
                                   context.user.type());
                        return;
                    }

                    context.modal_flow
                        .state('just_logged_out');
                    self.remove();
                });
            });

       

        profile.work_in.dispatch
            .on('valueChange.profile', function () {
                set_modal_color();
            });

        // they start with the same value,
        // depend on futher validation
        // or changes to the dom to enable
        // the save button.
        prev_valid = valid = true;
        validate();

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

    function reset_modal_color () {
        profile.work_in.data().forEach(function (d, i) {
            context.modal_flow
                .el
                .display
                .modal
                .el
                .classed(d.value, false);
        });
    }

    function enable_save() {
        save_button
            .classed('enabled', true)
            .on('click', function () {
                save_flow();
            });
    }

    function disable_save () {
        save_button
            .classed('enabled', false)
            .on('click', null);
    }

    function validate () {
        // deal with validation
        if (validatable.areValid()) {
            valid = true;
        } else {
            valid = false;
        }

        // check to see if any of the
        // updatables, are updated.
        // they are not validatable,
        // just potentially, different.
        profile.updatable.check();

        // determine button functionality
        // based on validation and 
        // updatable object status
        if (profile.updatable.updated().length > 0) {
            if (valid) {
                enable_save();
            } else {
                disable_save();
            }
        } else {
            disable_save();
        }

        prev_valid = valid;

        return valid;
    }

    function save_flow () {
        var data_to_submit =
            profile.decorate_for_submittal(update_user_data());

        save_button.text('Saving...');

        context
            .api
            .steamie_update(data_to_submit,
                             function (err, response) {
            if (err) {
                console.log('err');
                console.log(err);
                return;
            }
            
            console.log('do something with');
            console.log(response);

            var results = JSON.parse(response.responseText);

            console.log(results);
            // reset user data
            // useful since the top_level_geo value
            // might have been udpated, and that
            // should be reflected when the user asks
            // to locate themselves.
            context.user.data(results);
            profile.data(results);

            // resets the initial values to the ones saved
            // to the server. in case the user continues to
            // do work while its being saved.
            profile.updatable.resetInitialValues();

            // reset the initial value of geo manually
            // since it gets validated server side
            profile.geo
                .initialValue(results.top_level_input)
                .updateDOM();

            // will reset the save button, unless
            // they have continued to edit
            validate();
            save_button.text('Save');
        });
    }

    function update_user_data () {
        // something should be updated

        // updated data to be sent to
        // the server for saving
        var data_for_server = {},
            // copy of the data in profile.data,
            // to update and send propogate
            // out to the user object, also 
            // back down into the profile object.
            data = profile.data();

        profile.updatable.updated().forEach(function (n, i) {
            var cur_value = n.value();
            n.value_being_saved = cur_value;
            if (n.position_in_data.length === 1) {

                data[n.position_in_data[0]] =
                    cur_value;

                data_for_server[n.position_in_data[0]] =
                    cur_value;

            } else if (n.position_in_data.length === 2) {

                data[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    cur_value;

                // data for server may not have the correct
                // nested object to save against
                if (!data_for_server[n.position_in_data[0]]) {
                    data_for_server[n.position_in_data[0]] =
                        data[n.position_in_data[0]];
                }

                data_for_server[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    cur_value;
            }
        });

        return data_for_server;
    }

    return self;
};