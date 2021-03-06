var Checkmark = require('../ui/checkmark');

module.exports = function socialAuthSelection (context) {
    var social = {},
        valid = false,
        selected = false,
        visualize_validation = false,
        // parent node where options will be appended
        node,
        dispatch = social.dispatch = d3.dispatch('valid'),
        data = [{
            name: 'Twitter',
            url: context.api.base + '/login/twitter/',
            selected: false
        },{
            name: 'Facebook',
            url: context.api.base + '/login/facebook/',
            selected: false
        },{
            name: 'Google',
            url: context.api.base + '/login/google-oauth2/',
            selected: false
        }],
        login_option_sel;

    social.render = function () {

        login_option_sel = node
            .selectAll('.login-option')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'login-option')
            .attr('id', function (d) {
                return 'add-yourself-login-' +
                    d.name.toLowerCase();
            })
            .on('click.social-internal', function (d, i) {
                // items can only be selected
                // not unselected. any selection
                // is a valid selection.

                var cur = d.name;
                selected = d;

                login_option_sel.each(function (d) {
                    var bool = (cur === d.name);

                    d.selected = bool;

                    d3.select(this)
                        .classed('selected', bool);

                });

                valid = true;

                dispatch.valid.apply(this, arguments);
            })
            .text(function (d) {
                return d.name;
            });

        if (visualize_validation) {
            login_option_sel.call(Checkmark());
        }

        return social;
    };

    social.node = function (x) {
        if (!arguments.length) return node;
        node = x;
        return social;
    };

    social.isValid = function () {
        return valid;
    };

    social.selected = function () {
        return selected;
    };

    return social;
};