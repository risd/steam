var Editable = require('../editable'),
    Checkmark = require('../ui/checkmark');

module.exports = function dropdownConditionalText () {
    var self = {},
        prev_valid = false,
        valid = false,
        root_selection,
        text_selection,
        editable_text,
        checkmark_sel,
        options,
        select_wrapper,
        select,
        select_options;

    self.dispatch = d3.dispatch('validChange');

    self.isValid = function () {
        return valid;
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
            select.property('value');
        }
    };

    self.rootSelection = function (x) {
        if (!arguments.length) return root_selection;
        root_selection = x;
        return self;
    };

    self.options = function (x) {
        if (!arguments) return options;
        options = x;
        return self;
    };

    self.render = function () {
        // add validation visualization
        root_selection
            .call(Checkmark());
        checkmark_sel = root_selection.select('.checkmark');

        select_wrapper =
            root_selection
                .append('div')
                .attr('class', 'input-select');

        text_selection =
            root_selection
                .append('div')
                .attr('class', 'input-text hide-til-active active');


        editable_text = Editable()
                            .selection(text_selection)
                            .placeholder('00000')
                            .label({
                                type: 'p',
                                label: 'enter your zipcode'
                            })
                            .render();

        editable_text
            .dispatch
            .on('validChange', function () {
                validate();
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
            });

        select
            .selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .attr('value', function(d) {
                return d.country;
            })
            .text(function(d) {
                return d.country;
            });

        return self;
    };

    function validate () {
        if ((editable_text.isValid() &&
             text_selection.classed('active')) ||
            (text_selection.classed('active') === false)) {

            valid = true;
        } else {
            valid = false;
        }

        checkmark_sel.classed('valid', valid);

        if (valid !== prev_valid) {
            self.dispatch
                .validChange.apply(this, arguments);
        }

        prev_valid = valid;

        return valid;
    }

    return self;
};