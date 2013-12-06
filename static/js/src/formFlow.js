var validator = require('./validators');

module.exports = FormFlow;

function FormFlow (context) {
    var form = {},
        state,              // current state
        previous_state,     // previous state
        type,               // institution/individual
        input_data,         // object that tracks input data
        child_window,       // ref to the popup window object
        child_status;       // set interval function to check

    var ui = {
        popup_window_properties: function () {
            var cur_window = {};
            if (window.screenX) {
                cur_window.x = window.screenX;
                cur_window.y = window.screenY;
            } else {
                cur_window.x = window.screenLeft;
                cur_window.y = window.screenTop;
            }

            if (document.documentElement.clientHeight) {
                cur_window.height = document
                                    .documentElement
                                    .clientHeight;
                cur_window.width = document
                                    .documentElement
                                    .clientWidth;
            } else {
                cur_window.height = window.innerHeight;
                cur_window.width = window.innerWidth;
            }

            cur_window.x += 50;
            cur_window.y += 50;
            cur_window.height -= 100;
            cur_window.width -= 100;

            return cur_window;
        }
    };

    var el = {
        button: {
            deactivate: d3.select('#close-modal'),
            back: d3.select('#back-modal-add-yourself'),

            activate: d3.select('#activate-add-yourself'),

            type_choice_individual:
                d3.select('#add-yourself-type-individual'),

            type_choice_institution:
                d3.select('#add-yourself-type-institution'),

            submit_individual:
                d3.select('#individual-submit-button'),

            submit_institution:
                d3.select('#institutio-submit-button')

        },
        display: {
            modal: d3.select('#modal'),
            call_to_action: d3.select('#call-to-action'),
            auth_choices: d3.select('#add-yourself-login'),
            form_individual:
                d3.select('#add-yourself-individual-form-wrapper'),
            form_institution:
                d3.select('#add-yourself-institution-form-wrapper'),
            modal_toolbar: d3.select('#modal-toolbar')
        }
    };

    var states = {
        inactive: function () {
            el.display
                .modal
                .classed('active', false);

            el.button
                .back
                .classed('active', false);

            el.display
                .call_to_action
                .classed('active', false);

            el.display
                .auth_choices
                .classed('active', false);

            el.display
                .form_individual
                .classed('active', false);

            el.display
                .form_institution
                .classed('active', false);
        },
        choose_auth: function () {
            // depends on having set
            // a type (individual/institution)
            el.display
                .modal
                .classed('active', true);

            el.button
                .back
                .classed('active', true);

            el.display
                .call_to_action
                .classed('active', false);

            el.display
                .auth_choices
                .classed('active', true)
                .select('.form_type')
                .text('Authorize as ' + type);

            el.display
                .form_individual
                .classed('active', false);

            el.display
                .form_institution
                .classed('active', false);
        },
        call_to_action: function () {
            el.display
                .modal
                .classed('active', true);

            el.button
                .back
                .classed('active', false);

            el.display
                .call_to_action
                .classed('active', true);

            el.display
                .auth_choices
                .classed('active', false);

            el.display
                .form_individual
                .classed('active', false);

            el.display
                .form_institution
                .classed('active', false);
        },
        fill_out_individual: function () {

            el.display
                .modal
                .classed('active', true);

            el.button
                .back
                .classed('active', true);

            el.display
                .call_to_action
                .classed('active', false);

            el.display
                .auth_choices
                .classed('active', false);

            el.display
                .form_individual
                .classed('active', true);

            el.display
                .form_institution
                .classed('active', false);

        },
        fill_out_institution: function () {
            
            el.display
                .modal
                .classed('active', true);

            el.button
                .back
                .classed('active', true);

            el.display
                .call_to_action
                .classed('active', false);

            el.display
                .auth_choices
                .classed('active', false);

            el.display
                .form_individual
                .classed('active', false);

            el.display
                .form_institution
                .classed('active', true);
        }
    };

    var login = [{
        'name': 'Twitter',
        'url': context.api.base + '/login/twitter/'
    },{
        'name': 'Facebook',
        'url': context.api.base + '/login/facebook/'
    },{
        'name': 'Google',
        'url': context.api.base + '/login/google-oauth2/'
    }];

    form.state = function (x) {
        if (!arguments.length) return state;

        if (x in states) {
            prev_state = state;
            state = x;
            states[state]();
        }

        return form;
    };

    form.type = function (x) {
        if (!arguments.length) return type;
        type = x;
        return form;
    };

    form.add_avatar = function (x) {
        el.display.modal_toolbar
            .append('div')
            .attr('class', 'avatar rounded')
            .append('img')
            .attr('src', x);
        return form;
    };

    form.grab_input_data = function () {
        console.log('grab input data');

        // clear input data
        input_data = {};
        input_data[type] = {};

        // set id of form to grab input data from
        var id;
        if (type === 'individual') {
            id = '#add-yourself-individual-form-wrapper';
        } else {
            id = '#add-yourself-institution-form-wrapper';
        }

        var steamie_values = [
            'zip_code',
            'engaged_as',
            'work_in',
            'tags',
            'description',
            'description'
        ];

        // get all of the input values
        d3.selectAll(id + ' input')
            .each(function () {
                var key = d3.select(this).attr('data-mapped');
                if (steamie_values.indexOf(key) > -1) {
                    // save to steamie
                    input_data[key] = this.value;
                } else {
                    // save to type model
                    input_data[type][key] = this.value;
                }
            });

        return form;
    };

    form.submit_flow = function () {
        console.log('submit flow');

        // data must be mapped to
        // look like the response from
        // http://0.0.0.0:5000/api/v1/steamie/?format=json
        // or else, values are turned to null
        // so, perhaps, instead of just
        // grabbing the data and putting it
        // the format produced by grab_input_data
        // this form should have an object that
        // IS that response. the initial auth
        // check. Then updating data in a form
        // updates the data in the object
        // and submitting it, just sends it back
        // to the server. about right, yeah.
        form.grab_input_data();


        // override input data for testing
        input_data = {
            "meta": {
                "total_count": 1
            },
            "objects": [{
                "description": "new description",
                "individual": {
                    "email": "rrr@r.me",
                    "first_name": "ruben",
                }
            }]
        };
        complete_submit();
        // console.log(input_data);
        // end override

        // form
        //     .validator()[type]  // returns LGTM obj
        //     .validate(input_data)
        //     .then(function (result) {
        //         console.log(result);
        //         if (result.valid) {
        //             complete_submit();
        //         } else {
        //             show_validation_errors(result.errors);
        //         }
        //     });
    };

    function complete_submit() {
        console.log('complete submit');
        // submit data

        var csrf_token = get_cookie('csrftoken');
        console.log(csrf_token);

        console.log('url');
        console.log(context.api.steamie);
        // api.steamie
        // 'http://0.0.0.0:5000/api/v1/steamie/'
        var xhr = d3.xhr(context.api.steamie)
            .mimeType('application/json')
            .header('X-CSRFToken', csrf_token)
            .header('Content-type', 'application/json')
            .send('PUT', JSON.stringify(input_data),
                    function (err, results) {
                console.log('results');
                // no results are returned.
                // so if you do get something back
                // its likely an error?
                // test it out.
                console.log(results);
            });

    }

    function show_validation_errors(errors) {
        console.log('show validation errors');
    }

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


    form.init = function () {
        el.button
            .activate
            .on('click', function () {
                if (previous_state === 'inactive') {
                    // first time through
                    form.state('call_to_action');
                } else {
                    form.state(prev_state);
                }
            });

        el.button
            .back
            .on('click', function () {
                form.state(prev_state);
            });

        el.button
            .type_choice_institution
            .on('click', function () {
                form.type('institution');

                if (context.user.authed()) {
                    form.state('fill_out_institution');
                } else {
                    form.state('choose_auth');
                }
            });

        el.button
            .type_choice_individual
            .on('click', function () {
                form.type('individual');

                if (context.user.authed()) {
                    form.state('fill_out_individual');
                } else {
                    form.state('choose_auth');
                }
            });

        var button_size = 45;

        el.button
            .deactivate
            .on('click', function () {
                form.state('inactive');
            })
            // used to draw the x
            .append('svg')
            .attr('width', button_size)
            .attr('height', button_size)
            .selectAll('line')
            .data([
                { x1: 0, y1: 0,
                  x2: button_size, y2: button_size },
                { x1: button_size, y1: 0,
                  x2: 0, y2: button_size }
            ])
            .enter()
            .append('line')
                .attr('x1', function (d) {
                    return d.x1;
                })
                .attr('y1', function (d) {
                    return d.y1;
                })
                .attr('x2', function (d) {
                    return d.x2;
                })
                .attr('y2', function (d) {
                    return d.y2;
                })
                .attr('stroke-width', 1)
                .attr('stroke', 'white');

        el.button
            .submit_institution
            .on('click', function () {
                console.log('needs to validate');
                console.log('submit');

                form.submit_flow();
            });

        el.button
            .submit_individual
            .on('click', function () {
                console.log('needs to validate');
                console.log('submit');

                form.submit_flow();
            });

        d3.select('#add-yourself-login')
            .selectAll('.login-option')
            .data(login)
            .enter()
            .append('div')
            .attr('class', 'login-option')
            .attr('id', function (d) {
                return 'add-yourself-login-' +
                    d.name.toLowerCase();
            })
            .on('click', function (d) {

                var popup = ui.popup_window_properties(),

                    window_features =
                        'width=' + popup.width + ',' +
                        'height=' + popup.height + ',' +
                        'left=' + popup.x + ',' +
                        'top=' + popup.y;

                child_window =
                    window.open(d.url, '',  window_features);

                child_status = setInterval(check_child, 1000);
            })
            .text(function (d) {
                return d.name;
            });

        form.state('call_to_action');

        return form;
    };

    function check_child () {
        if (child_window.closed) {
            // stop checking for the child window status
            clearInterval(child_status);

            // check to see if auth occured
            context.user.check_auth();
        } else {
            // console.log('child open');
        }
    }

    return form;
}