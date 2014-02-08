module.exports = function radioSelection () {
    var self = {},
        valid = false,
        selected = false,
        // parent node where options will be appended
        node,
        group_name,
        label,
        data = [],
        initial_selected = {
            value: undefined,
            selected: undefined,
            label: undefined
        };

    self.dispatch = d3.dispatch('valid',
                                'valueChange',
                                'valueDifferent');

    self.render = function () {
        // must call node(x) to
        // define a node before
        // calling .render()

        if (label) {
            node.append(label.type)
                .text(label.label)
                .attr('class', label.klass);
        }

        if (initial_selected) {
            selected = initial_selected;
        }

        var sel = node
            .selectAll('.type-option')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'type-option ')
            .on('mouseup.radio', function (d) {
                d3.event.stopPropagation();

                d3.select(this)
                    .select('input')
                    .node().checked = true;

                self.selected(d);
                
                valid = true;
                self.dispatch.valid.apply(this, arguments);
                self.dispatch.valueChange.apply(this, arguments);

                if (self.isDifferent()) {
                    self.dispatch
                        .valueDifferent.apply(this, arguments);
                    
                }
            })
            .call(addInput);

        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
        return self;
    };

    self.node = function (x) {
        if (!arguments.length) return node;
        node = x;
        return self;
    };

    self.data = function (x) {
        if (!arguments.length) return data;
        data = x;

        // if there is an initially
        // selected element, make the
        // object aware of it
        var initial;
        data.forEach(function (d, i) {
            if (d.selected === true) {
                initial = d;
            }
        });
        self.initialSelected(initial);

        return self;
    };

    self.groupName = function (x) {
        if (!arguments.length) return group_name;
        group_name = x;
        return self;
    };

    self.isValid = function () {
        return valid;
    };

    self.isDifferent = function () {
        console.log('initial ', self.initialSelected());
        console.log('selected ', self.selected());
        // compare initial_selected (entire object)
        // against the selected() function,
        // which manages the data objects
        // and only returns the .value attr of
        // the selected item
        if (self.initialSelected()) {
            if (self.initialSelected() !==
                self.selected()) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    self.initialSelected = function (x) {
        // must have a data object to reference
        if (!arguments.length) return initial_selected.value;

        if (typeof(x) === 'string') {
            data.forEach(function (n, i) {
                if (x === n.value) {
                    initial_selected = n;
                }
            });
        } else if (typeof(x) === 'object') {
            // its an object?
            data.forEach(function (n, i) {
                if (x.value === n.value) {
                    initial_selected = n;
                }
            });
        }

        return self;
    };

    self.selected = function (x) {
        // must have a data object to reference
        if (!arguments.length) return selected.value;

        if (typeof(x) === 'string') {
            data.forEach(function (n, i) {
                if (x === n.value) {
                    selected = n;
                    n.selected = true;
                } else {
                    n.selected = false;
                }
            });
        } else if (typeof(x) === 'object') {
            data.forEach(function (n, i) {
                if (x.value === n.value) {
                    selected = n;
                    n.selected = true;
                } else {
                    n.selected = false;
                }
            });
        }

        return selected;
    };

    function addInput (sel) {

        sel.append('input')
            .attr('type', 'radio')
            .attr('class', 'checkbox')
            .attr('name', group_name)
            .attr('id', function (d, i) {
                return 'type-option-' + d.value;
            })
            .property('checked', function (d) {
                if (d.selected) {
                    valid = true;
                }
                return d.selected;
            });

        var label_sel = sel.append('label')
            .attr('class', 'type-option-label')
            .attr('for', function (d, i) {
                return 'type-option-' + d.value;
            });

        label_sel
            .append('span')
            .attr('class', 'text')
            .text(function (d, i) {
                return d.label;
            });

        label_sel
            .append('span')
            .attr('class', 'indicator')
            .append('span')
            .attr('class', 'fill');
    }

    return self;
};