var textComponent = require('./text'),
    Checkmark = require('../ui/checkmark');

module.exports = function dropdownConditionalText () {
    var self = {},
        valid = false,
        root_selection,
        text_selection,
        editable_text,
        checkmark_sel,
        checkmark_bool = true,
        options,
        options_key,
        select_wrapper,
        select,
        select_options,
        placeholder,
        initial_value,
        rendered = false;

    self.dispatch = d3.dispatch('valueChange');

    self.isValid = function () {
        return validate();
    };

    self.validationVisual = function (x) {
        if (!arguments.length) return checkmark_bool;
        checkmark_bool = x;
        return self;
    };

    self.validatedData = function () {
        // if the editable text selection is
        // active, then you are looking at
        // something in the US, and should
        // return the value of the text field

        // otherwise, get the value from the drop down
        // to send back to the server
        if (text_selection.classed('active')) {
            return editable_text.value();
        } else {
            return select.property('value');
        }
    };

    self.initialValue = function (x) {
        if (!arguments.length) return initial_value;
        initial_value = x;
        return self;
    };

    self.updateDOM = function () {
        update_visual_display();
        return self;
    };

    self.isDifferent = function () {
        if (self.initialValue() === self.validatedData()){
            return false;
        } else {
            return true;
        }
    };


    self.rootSelection = function (x) {
        if (!arguments.length) return root_selection;
        root_selection = x;
        return self;
    };

    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return self;
    };

    self.options = function (x) {
        if (!arguments.length) return options;
        options = x;

        if (options[options.length-1].country === '') {
            options.pop();
        }

        return self;
    };

    // function that gets values out of the options array
    self.optionsKey = function (x) {
        if (!arguments.length) return options_key;
        options_key = x;
        return self;
    };

    self.render = function () {
        // set the initial values for rendering
        var render_args = args_for_rendering();

        // add validation visualization
        if (checkmark_bool) {
            root_selection
                .call(Checkmark());
            checkmark_sel = root_selection.select('.checkmark');
        }

        select_wrapper =
            root_selection
                .append('div')
                .attr('class', 'input-select');

        text_selection =
            root_selection
                .selectAll('.input-text')
                .data(render_args.text_selection_data)
                .enter()
                .append('div');

        text_selection
                .attr('class', function (d) {
                    var active = d.active ? ' active' : '';
                    return 'input-text hide-til-active' + active;
                });


        editable_text = textComponent()
                            .selection(text_selection)
                            .placeholder(placeholder)
                            .initialValue(render_args.editable_text)
                            .valid(function (val) {
                                // only accepts 5 digit
                                // zipcode as a valid one
                                if (val.length === 5) {
                                    return true;
                                } else {
                                    return false;
                                }
                            })
                            .render();

        editable_text
            .dispatch
            .on('valueChange.dropdownConditionalText', function () {
                self.dispatch.valueChange.apply(this, arguments);
            });


        select = select_wrapper
            .append('select')
            .on('change', function () {
                if (select.property('value') ===
                    'United States of America') {

                    text_selection
                        .classed('active', true);
                } else {
                    text_selection
                        .classed('active', false);
                }
                validate();

                self.dispatch.valueChange.apply(this, arguments);
            });

        select
            .selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .attr('value', options_key)
            .text(options_key)
            .property('value', options_key);

        // select initial
        select.property('value', render_args.value_selected);

        // set state based on render
        validate();

        rendered = true;

        return self;
    };

    function validate () {
        if ((editable_text.valid() &&
             text_selection.classed('active')) ||
            (text_selection.classed('active') === false)) {

            valid = true;
        } else {
            valid = false;
        }

        if (checkmark_bool) {
            checkmark_sel.classed('valid', valid);
        }

        return valid;
    }

    function args_for_rendering () {
        // based on an initial value, there are
        // three arguments needed for rendering
        // this component

        // defaults assume a zipcode is present
        var args = {
            text_selection_data: [{
                active: true
            }],
            editable_text: initial_value,
            value_selected: 'United States of America'
        };

        options.forEach(function (d, i) {
            if (d.country === 'United States of America') {
                return;
            }

            // 
            if (initial_value === d.country) {

                args.text_selection_data = [{
                    active: false
                }];

                args.editable_text = '';

                args.value_selected = d.country;
            }
        });

        return args;
    }

    function update_visual_display () {
        var args = args_for_rendering();

        console.log('updating visual for geo');
        console.log(args);

        text_selection
            .data(args.text_selection_data);

        text_selection
            .classed('active', function (d) {
                return d.active;
            });

        editable_text.value(args.editable_text);

        select.property('value', args.value_selected);
    }

    return self;
};