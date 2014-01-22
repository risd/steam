// gives an element simple placeholder
// functionality that is enjoyed by
// input elements.

// pass in a d3 selected dom node with a placeholder attr,
// or pass one in
// ensures contenteditable is true
// if on focus, placeholder = value, remove
// the contents
// if on unfocus, there is no value, replace
// the placeholder
module.exports = Editable;

function Editable () {
    var self = {},
        placeholder = '',
        focused = false,
        prev_valid = false,
        valid = false,
        editable_placeholder = '00000',
        initial_value,
        selection,
        editable, // selection for editable div
        label; // d.type, d.label

    self.dispatch = d3.dispatch('validChange', 'valueChange');

    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
        return self;
    };

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.initialValue = function (x) {
        if (!arguments.length) return initial_value;
        initial_value = x;
        return self;
    };

    self.value = function (x) {
        if (!arguments.length) return editable.html();

        // if editable is defined, change the value
        if (editable) {
            editable.html(value);
        } else {
            initial_value = x;
        }

        return self;
    };

    self.isValid = function () {
        return valid;
    };

    self.render = function () {
        selection
            .append(label.type)
            .text(label.label);

        editable = selection
            .append('div')
            .attr('contenteditable', 'true')
            .attr('class', 'large editable')
            .attr('id', 'add-yourself-zip')
            .attr('placeholder', editable_placeholder)
            .html(
                initial_value ?
                initial_value :
                editable_placeholder);
        
        editable
            .on('focus.editable-internal', function () {
                editable.classed('focused', true);
                if (editable.html() === editable_placeholder) {
                    editable.html('');
                }
                focused = true;
            })
            .on('blur.editable-internal', function () {
                editable.classed('focused', false);

                var cur_html = editable.html();

                // firefox will put a break tag in
                // your input when empty.
                if ((cur_html === '') ||
                    (cur_html.indexOf('<br>') > -1)) {
                    editable.html(placeholder);
                    editable.classed('value-set', false);
                } else {
                    editable.classed('value-set', true);
                }
                focused = false;
            })
            .on('keydown.editable-internal', function () {
                // do not allow 'enter' (keycode 13)
                // do not allow more than 8 characters.
                //   if more than 8, only allow
                //   backspace (keycode 8)
                if ((d3.event.keyCode === 13) ||
                    ((d3.select(this).text().length >= 8) &&
                     (d3.event.keyCode !== 8))) {
                    d3.event.preventDefault();
                }
            })
            .on('keyup.editable-internal', function () {
                validate();

                editable.classed('valid', valid);

                if (valid !== prev_valid) {
                    self.dispatch
                        .validChange.apply(this, arguments);
                }

                self.dispatch
                    .valueChange.apply(this, arguments);

                prev_valid = valid;
            });

        validate();

        return self;
    };

    function validate () {
        if ((editable.html() === placeholder) ||
            (editable.html() === '')) {
            valid = false;
        } else {
            valid = true;
        }

        return valid;
    }

    
    return self;
}