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

    editable.value = function (x) {
        return node.html();
    };

    editable.node = function () {
        return node;
    };

    function init () {

        var dom_placeholder = node.attr('placeholder');
        if (dom_placeholder) {
            placeholder = dom_placeholder;
        }

        node.on('focus.editable', function () {
                node.classed('focused', true);
                if (node.html() === placeholder) {
                    node.html('');
                }
                focused = true;
            })
            .on('blur.editable-internal', function () {
                node.classed('focused', false);

                var cur_html = node.html();

                // firefox will put a break tag in
                // your input when empty.
                if ((cur_html === '') ||
                    (cur_html.indexOf('<br>') > -1)) {
                    node.html(placeholder);
                    node.classed('value-set', false);
                } else {
                    node.classed('value-set', true);
                }
                focused = false;
            })
            .on('keydown.editable-replace', function () {
                // do not allow 'enter' (keycode 13)
                // do not allow more than 8 characters.
                //   if more than 8, only allow
                //   backspace (keycode 8)
                if ((d3.event.keyCode === 13) ||
                    ((d3.select(this).text().length >= 15) &&
                     (d3.event.keyCode !== 8))) {
                    d3.event.preventDefault();
                }
            })
            .html(placeholder);
    }

    init ();

    return editable;
}