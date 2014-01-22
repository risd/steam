var geoComponent =
        require('./formComponents/dropdownConditionalText'),
    radioComponent =
        require('./formComponents/radio');

module.exports = function ProfileInstitution (context) {
    var self = {},
        selection,
        geo_options,
        data;

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.data = function (x) {
        if (!arguments.length) return data;
        data = x;
        return self;
    };

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.build = function () {
        selection.datum(data).call(build);

        d3.selectAll('.profile-link')
            .classed('active', true)
            .on('click', function () {
                context.modal_flow.state('profile_institution');
            });

        return self;
    };

    function build (sel) {
        var first_row = sel.append('div').attr('row clearfix');
    }

    return self;
};