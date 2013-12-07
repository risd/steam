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

function Editable (node) {
    var editable = {},
        placeholder = '',
        focused = false;

    editable.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return editable;
    };

    function set_placeholder () {
        if (node.html() === placeholder) {

        }
        node.html(placeholder);
    }

    function init () {

        var dom_placeholder = node.attr('placeholder');
        if (dom_placeholder) {
            placeholder = dom_placeholder;
        }

        node.on('focus', function () {
                node.classed('focused', true);
                if (node.html() === placeholder) {
                    node.html('');
                }
                focused = true;
            })
            .on('blur', function () {
                node.classed('focused', false);
                if (node.html() === '') {
                    node.html(placeholder);
                    node.classed('value-set', false);
                } else {
                    node.classed('value-set', true);
                }
                focused = false;
            })
            .html(placeholder);
    }

    init ();

    return editable;
}