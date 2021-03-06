var geoComponent =
        require('./formComponents/dropdownConditionalText'),

    radioComponent =
        require('./formComponents/radio'),

    socialAuthComponent =
        require('./formComponents/socialAuthSelection'),

    modalAnimation =
        require('./formComponents/modalAnimation'),

    svg_cross =
        require('./svg/svgCross'),

    svg_next_arrow =
        require('./svg/svgNextArrow');

module.exports = ModalFlow;

function ModalFlow (context) {
    var self = {},
        state,              // current state
        previous_state,     // previous state
        input_data;         // object that tracks input data

    self.dispatch = d3.dispatch('ApplyStateWaitingForAddMeFlow',
                                'ApplyStateChooseTypeAddZip',
                                'ApplyStateLeavingThankYou');

    // form components
    var social_auth =
            socialAuthComponent(context)
                .node(d3.select('#add-yourself-login')),

        select_geo =
            geoComponent()
                .rootSelection(d3.select('#add-yourself-geo'))
                .validationVisual(false)
                .optionsKey(function (d) { return d.country; })
                .placeholder('zipcode')
                .initialValue(''),

        select_type =
            radioComponent()
                .node(d3.select('#select-type-component'))
                .groupName('steamie_type')
                .data([{
                    label: 'Individual',
                    value: 'individual',
                    selected: false
                }, {
                    label: 'Organization',
                    value: 'institution',
                    selected: false
                }]),

        select_work_in =
            radioComponent()
                .node(d3.select('#select-work-in-component'))
                .label({
                    label: 'I work in the following area',
                    type: 'p',
                    klass: ''
                })
                .groupName('steamie_work_in')
                .data([{
                    label: 'Research',
                    value: 'research',
                    selected: false
                }, {
                    label: 'Education',
                    value: 'education',
                    selected: false
                }, {
                    label: 'Policy',
                    value: 'political',
                    selected: false
                }, {
                    label: 'Industry',
                    value: 'industry',
                    selected: false
                }]),

        modal_animation = modalAnimation();

    // elements that need to be turned on and off
    var el = self.el = {
        button: {
            close_modal: {
                el: d3.selectAll('.close-button'),
                on_click: function () {
                    if (context.user.profile.built()) {
                        self.state('inactive_with_profile');
                    } else {
                        self.state('inactive_no_profile');
                    }
                },
                append_to_el: svg_cross
            },
            open_modal: {
                el: d3.select('#activate-add-yourself'),
                on_click: function () {
                    if ((typeof(previous_state) === 'undefined') |
                        (previous_state === 'inactive_no_profile') |
                        (previous_state === 'just_logged_out') |
                        (previous_state === 'about')) {

                        self.state('call_to_action');
                    } else {
                        self.state(previous_state);
                    }
                    // analytics
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Index - Add Me');
                },
                append_to_el: function () {}
            },

            about: {
                el: d3.select('#activate-about'),
                on_click: function () {
                    self.state('about');
                    // analytics
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Index - About');
                },
                append_to_el: function () {}
            },

            about_to_action: {
                el: d3.select('#about_to_action'),
                on_click: function () {
                    self.state('call_to_action');
                    // analytics
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'About - Add Me');
                },
                append_to_el: function () {}
            },

            add_me: {
                el: d3.select('#add-me-button'),
                on_click: function () {},
                append_to_el: function () {}
            },

            auth_me: {
                el: d3.select('#auth-me-button'),
                on_click: function () {},
                append_to_el: function (sel) {
                    sel.select('p').text('Next');
                }
            },

            go_to_profile: {
                el: d3.select('#go-to-profile'),
                on_click: function () {
                    self.state('profile_' + context.user.type());
                    self.dispatch.ApplyStateLeavingThankYou();
                    // analytics
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Post sign up - Profile');
                },
                append_to_el: function () {}
            },

            explore_map: {
                el: d3.select('#explore-map'),
                on_click: function () {
                    self.state('inactive_with_profile');
                    self.dispatch.ApplyStateLeavingThankYou();
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Post sign up - Explore map');
                },
                append_to_el: function () {}
            },

            explore_locate_me: {
                el: d3.select('#explore-locate-me'),
                on_click: function () {
                    self.state('inactive_with_profile');
                        
                    var d = context.user.data(),
                        type  = context.user.type();

                    context.network
                        .highlight({
                            tlg_id: d.top_level.id,
                            steamie_type: type,
                            steamie_id: d[type].id,
                            steamie: [d]
                        });
                    self.dispatch.ApplyStateLeavingThankYou();
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Post sign up - Locate me');
                },
                append_to_el: function () {}
            },

            profile_link: {
                el: d3.select('#profile-link'),
                on_click: function () {
                    self.state('profile_' + context.user.type());
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Index - Profile');
                },
                append_to_el: function () {}
            },
            cancel_add_button: {
                el: d3.select('#cancel-add-button'),
                on_click: function () {
                    self.state('logging_out');
                    context.api.logout(function (err, results) {
                        if (!results) {
                            self.state('choose_type_add_zip');
                            return;
                        }
                        self.state('just_logged_out');
                    });
                    ga('send',
                       'event',
                       'button',
                       'click',
                       'Profile - Logout');
                },
                append_to_el: function () {}
            }
        },
        modal_header: {
            join: {
                el: d3.select('#modal-header-join')
            },
            thanks: {
                el: d3.select('#modal-header-thanks')
            },
            avatar: {
                el: d3.select('#modal-header-avatar')
            },
            logging_out: {
                el: d3.select('#modal-header-logging-out')
            },
            about: {
                el: d3.select('#modal-header-about')
            }
        },
        display: {
            modal: {
                el: d3.select('#modal')
            },
            call_to_action: {
                el: d3.select('#call-to-action')
            },
            choose_type_add_zip: {
                el: d3.select('#choose-type-add-zip')
            },
            thank_you: {
                el: d3.select('#thank-you')
            },
            profile_individual: {
                el: d3.select('#profile-individual')
            },
            profile_institution: {
                el: d3.select('#profile-institution')
            },
            about: {
                el: d3.select('#about')
            }
        }
    };

    var states = {
        logging_out: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'modal_header',
                el_name: 'logging_out'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
        },
        just_logged_out: function () {
            self.state('inactive_no_profile');
        },
        inactive_no_profile: function () {
            var active = [{
                el_type: 'button',
                el_name: 'open_modal'
            }, {
                el_type: 'button',
                el_name: 'about'
            }];
            apply_state(active);
        },
        inactive_with_profile: function () {
            var active = [{
                el_type: 'button',
                el_name: 'profile_link'
            }, {
                el_type: 'button',
                el_name: 'about'
            }];
            apply_state(active);
        },
        about: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'about'
            }, {
                el_type: 'modal_header',
                el_name: 'about'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            if (!context.user.profile.built()) {
                // if someone isn't logged in, 
                // give them the button to do so
                active = active.concat([{
                    el_type: 'button',
                    el_name: 'about_to_action'
                }]);
            }

            apply_state(active);
        },
        call_to_action: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'call_to_action'
            }, {
                el_type: 'modal_header',
                el_name: 'join'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
        },
        choose_type_add_zip: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'choose_type_add_zip'
            }, {
                el_type: 'modal_header',
                el_name: 'join'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }, {
                el_type: 'button',
                el_name: 'cancel_add_button'
            }];

            apply_state(active);
            self.dispatch.ApplyStateChooseTypeAddZip();
        },
        waiting_for_add_me_flow: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
            self.dispatch.ApplyStateWaitingForAddMeFlow();
        },
        thank_you: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'thank_you'
            }, {
                el_type: 'modal_header',
                el_name: 'thanks'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
        },
        profile_individual: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'profile_individual'
            }, {
                el_type: 'modal_header',
                el_name: 'avatar'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
        },
        profile_institution: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'profile_institution'
            }, {
                el_type: 'modal_header',
                el_name: 'avatar'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
        }
    };

    self.init = function () {

        for (var key in el.button) {
            // setup buttons
            el.button[key]
                .el
                .on('click', el.button[key].on_click)
                .call(el.button[key].append_to_el);
        }

        social_auth.render();
        select_type.render();
        select_work_in.render();
        modal_animation
            .selection(d3.select('#modal-animation'));

        self.dispatch
            .on('ApplyStateWaitingForAddMeFlow',
                function () {
                    modal_animation.render();
                });

        self.dispatch
            .on('ApplyStateChooseTypeAddZip', function () {
                // if you get kicked back to this state,
                // you shouldn't have the animation
                modal_animation.remove();
            });

        self.dispatch
            .on('ApplyStateLeavingThankYou', function () {
                modal_animation.remove();
            });

        if (context.countries.data()) {
            // if the data is loaded already,
            // populate the select_geo module
            select_geo
                .options(context.countries.data())
                .render();
        } else {
            // wait until it is loaded, and then
            // render based on results
            context.countries.dispatch.on('loaded.modal', function () {
                select_geo
                    .options(context.countries.data())
                    .render();
            });
        }

        // how validation can propogate to this level
        social_auth
            .dispatch
            .on('valid.formElementCheck', function (d, i) {
                if (authIsValid()) {
                    enable_auth_me();
                }
            });

        select_geo
            .dispatch
            .on('valueChange.formElementCheck', function () {
                validate_add_me();
            });

        select_type
            .dispatch
            .on('valid.formElementCheck', function (d) {
                validate_add_me();
            });

        select_work_in
            .dispatch
            .on('valid.formElementCheck', function (d) {
                validate_add_me();
            })
            .on('valueChange.formElementCheck', function () {
                set_modal_color();
            });

        context.user
               .dispatch.on('checkAuthComplete', function(err, d) {

            d = context.user.data();

            // remove loading svg
            d3.select('#loading')
                .classed('active', false);
            // make the modal accessible
            el.button.open_modal
                .el
                .classed('active', true);

            if (context.user.authed()) {
                // authenticated

                self.add_avatar(d.avatar_url);

                if ((d.top_level) &&
                    ((d.individual) ||
                     (d.institution))) {

                    // should have given all info
                    // to be signed up and dont have
                    // to be sold on it
                    self.state('inactive_with_profile');

                    if (d.individual) {
                        context.user.type('individual');
                    }
                    else if (d.institution) {
                        context.user.type('institution');
                    }

                    context.user
                        .profile
                            .build();

                } else {

                    // have authenticated, but no
                    // data associated with them
                    self.state('choose_type_add_zip');
                }


            } else {
                // has not been authenticated
                // assume the user has never been
                // and ask them to sign up
                self.state('inactive_no_profile');

                // self.state('thank_you');
                // self.state('waiting_for_add_me_flow');
                // self.state('choose_type_add_zip');
            }
        });

        return self;
    };

    self.add_avatar = function (x) {

        d3.selectAll('.avatar')
            .attr('src', x);

        return self;
    };

    self.state = function (x) {
        if (!arguments.length) return state;

        if (x in states) {
            previous_state = state;
            state = x;
            states[state]();
        }

        return self;
    };

    function add_me_flow () {
        // set state
        self.state('waiting_for_add_me_flow');


        // for the User that is stored.
        context.user
            .type(select_type.selected())
            .setTypeDefaults()
            .work_in(select_work_in.selected())
            .top_level_input(select_geo.validatedData());

        context.api.steamie_update(
            context.user.data(),
            function (err, results_raw) {
                if (err) {
                    return;
                }

                var results = JSON.parse(results_raw.responseText);

                if (!results.top_level_input) {

                    // if there is an error, return
                    // the user to the stage where
                    // they left off, attempting to
                    // be added.
                    self.state('choose_type_add_zip');
                    return;
                }

                // update the user data based on
                // what came back from the server
                // also builds out an initial profile
                // for the user based on their new
                // data input
                context.user
                    .data(results)
                    // .setUpdateObject()
                    .profile
                        .build();

                // show thank you
                self.state('thank_you');
            });
    }

    function process_authentication (d) {
        window.location = d.url;
    }

    function apply_state (active) {
        // referencing the el obj of this module
        
        for (var type_key in el) {
            for (var name_key in el[type_key]) {
                if (active.length === 0) {
                    // set all hidden
                    el[type_key][name_key]
                        .el
                        .classed('active', false);
                } else {
                    var status_to_set = false;

                    for (var i = 0; i < active.length; i++) {
                        if ((active[i].el_type === type_key) &&
                            (active[i].el_name === name_key)) {

                            status_to_set = true;
                        }
                    }

                    el[type_key][name_key]
                            .el
                            .classed('active', status_to_set);
                }
            }
        }
    }

    // ensure validity of form elements
    function validate_add_me () {
        if (select_geo.isValid() &&
            select_type.isValid() &&
            select_work_in.isValid()) {
            
            enable_add_me();
            return true;
        } else {
            disable_add_me();
            return false;
        }
    }

    function authIsValid () {
        if (social_auth.isValid()) {
            return true;
        }
        return false;
    }

    // enable buttons to proceed through
    // the form process
    function enable_auth_me () {
        el.button.auth_me.el
            .classed('enabled', true)
            .on('click', function () {
                var p = el.button.auth_me.el.select('p'),
                    svg = el.button.auth_me.el.select('svg');
                d3.transition()
                    .duration(300)
                    .each(function () {
                        d3.transition(p)
                            .style('opacity', 0)
                            .transition(p)
                            .text('Redirecting...')
                            .style('opacity', 1);

                        d3.transition(svg)
                            .style('opacity', 0)
                            .remove();
                    });
                process_authentication(social_auth.selected());
            });
    }

    function enable_add_me () {
        el.button.add_me.el
            .classed('enabled', true)
            .on('click', function () {
                add_me_flow();
            });
    }

    function disable_add_me () {
        el.button.add_me.el
            .classed('enabled', false)
            .on('click', null);
    }

    function set_modal_color () {
        select_work_in.data().forEach(function (d, i) {
            el.display
                .modal
                .el
                .classed(d.value, d.selected);
        });
    }

    return self;
}