var Editable = require('../editable'),
    Checkmark = require('../ui/checkmark');

module.exports = function zipcodeComponent (selection) {
    var zipcode = Editable(selection),
        parent_sel = d3.select(selection.node().parentNode),
        valid = false;

    parent_sel
        .call(Checkmark());

    var checkmark_sel = parent_sel.select('.checkmark');

    // add validation visualization
    zipcode.node()
        .on('keyup.editable', function () {
            validate();

            zipcode.node().classed('valid', valid);
            checkmark_sel.classed('valid', valid);
        });

    zipcode.isValid = function () {
        return valid;
    };

    function validate () {
        if (zipcode.value() === zipcode.placeholder() ||
            (zipcode.value() === '')) {
            valid = false;
        } else {
            valid = true;
        }

        return valid;
    }

    return zipcode;
};