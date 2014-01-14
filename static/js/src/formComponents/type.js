module.exports = function typeSelection (context) {
    var self = {},
        valid = false,
        selected = false,
        // parent node where options will be appended
        node,
        data = [];

    self.dispatch = d3.dispatch('valid');

    self.render = function () {
        // must call node(x) to
        // define a node before
        // calling .render()

        var sel = node
            .selectAll('.type-option')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'type-option')
            .on('mouseup', function (d) {
                d3.event.stopPropagation();
                data.forEach(function (n, i) {
                    n.selected = false;
                });
                d.selected = true;
                selected = d;
                valid = true;
                self.dispatch.valid.apply(this, arguments);
            })
            .call(addInput);

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
        return self;
    };

    self.isValid = function () {
        return valid;
    };

    self.selected = function () {
        return selected;
    };

    function addInput (sel) {

        sel.append('input')
            .attr('type', 'radio')
            .attr('class', 'checkbox')
            .attr('name', 'category')
            .attr('id', function (d, i) {
                return 'type-option-' + d.type;
            });

        sel.append('label')
            .attr('class', 'type-option-label')
            .attr('for', function (d, i) {
                return 'type-option-' + d.type;
            })
            .text(function (d, i) {
                return d.name;
            });
    }

    return self;
};