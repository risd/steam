module.exports = function Profile (context) {
    var self = {},
        geo_options;

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.build = function () {
        if (context.user.type() === 'individual') {
            d3.select('#profile-individual')
                .call(build_individual);

        } else if (context.user.type() === 'institution') {
            d3.select('#profile-institution')
                .call(build_institution);
        }

        return self;
    };

    function build_individual (sel) {
        var first_row = sel.append('div').attr('row clearfix');

        var first_name = first_row
            .append('div')
            .attr('column one')
                .append('input')
                .attr('id', 'individual-first-name')
                .attr('data-mapped', 'first_name');

        var last_name = first_row
            .append('div')
            .attr('column one')
                .append('input')
                .attr('id', 'individual-last-name')
                .attr('data-mapped', 'last_name');

        var second_row = sel.append('div').attr('row clearfix');

        var email = second_row
            .append('div')
            .attr('column one')
                .append('input')
                .attr('id', 'individual-email')
                .attr('data-mapped', 'email');

        var geo = second_row
            .append('div')
            .attr('column one')
                .append('input')
                .attr('id', 'individual-email')
                .attr('data-mapped', 'email');
    }

    function build_institution (sel) {
        var first_row = sel.append('div').attr('row clearfix');
    }

    return self;
};