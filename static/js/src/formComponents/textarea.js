// textarea, with placeholder, and label
// dispatches when the value changes
// against the initial value

// there is no idea of validity,
// just whether or not a value
// has changed.
module.exports = function TextArea () {
    var self = {},
        selection,
        area_selection,
        placeholder = '',
        label,
        value,
        initial_value = '';

    self.dispatch = d3.dispatch('valueChange');

    self.render = function () {

        if (label) {
            selection.append(label.type)
                .text(label.label)
                .attr('class', label.klass);
        }

        area_selection = selection
            .append('textarea')
            .attr('placeholder', placeholder)
            .property('value', initial_value)
            .on('keyup.internal-text', function (d) {
                self.dispatch.valueChange.apply(this, arguments);
            });

        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
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
        return area_selection.node().value;
    };

    self.isDifferent = function () {
        if (self.value() !== initial_value) {
            return true;
        } else {
            return false;
        }
    };

    return self;
};