// text input, with placeholder
// dispatches when the value changes
// against the initial value

// there is no idea of validity,
// just whether or not a value
// has changed.
module.exports = function TextInput () {
    var self = {},
        selection,
        input_selection,
        placeholder,
        value,
        initial_value,
        valid_function = function (val) { return true; };

    self.dispatch = d3.dispatch('valueChange');

    self.render = function () {

        input_selection = selection
            .append('input')
            .attr('placeholder', placeholder)
            .property('value', initial_value);

        input_selection
            .on('keyup.internal-text', function (d) {
                self.dispatch.valueChange.apply(this, arguments);
            });

        return self;
    };



    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
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
        if (!arguments.length) {
            return input_selection.property('value');
        }
        input_selection.property('value', x);
        return self;
    };

    self.isDifferent = function () {
        if (self.value() !== initial_value) {
            return true;
        } else {
            return false;
        }
    };

    self.isNotEmpty = function () {
        if (self.value() &&
            self.value().length > 0) {
            return true;
        } else {
            return false;
        }
    };

    self.valid = function (x) {
        if (!arguments.length) {
            return valid_function(self.value());
        }
        // pass in a function that will validate
        // this text box
        valid_function = x;
        return self;
    };

    return self;
};