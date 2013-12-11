var Checkmark = require('../ui/checkmark');

module.exports = function socialAuthSelection (context) {
    var social = {},
        valid = false,
        // parent node where options will be appended
        node,
        data = [{
            name: 'twitter',
            url: context.api.base + '/login/twitter/',
            selected: false
        },{
            name: 'facebook',
            url: context.api.base + '/login/facebook/',
            selected: false
        },{
            name: 'google',
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
            .on('click.social-internal', function (d) {
                var cur = d.name;

                login_option_sel.each(function (d) {
                    var bool = (cur === d.name);

                    d.selected = bool;

                    d3.select(this)
                        .classed('selected', bool);

                });

                valid = true;
            })
            .text(function (d) {
                return d.name;
            })
            .call(Checkmark());

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

    return social;
};