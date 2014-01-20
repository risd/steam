var geoComponent =
        require('./formComponents/dropdownConditionalText'),
    radioComponent =
        require('./formComponents/radio');

module.exports = function Profile (context) {
    var self = {},
        geo_options,
        profile_selection;

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.build = function () {
        if (context.user.type() === 'individual') {
            profile_selection = d3.select('#profile-individual')
                .datum(context.user.data())
                .call(build_individual);

        } else if (context.user.type() === 'institution') {
            profile_selection = d3.select('#profile-institution')
                .datum(context.user.data())
                .call(build_institution);
        }

        d3.selectAll('.profile-link')
            .classed('active', true)
            .on('click', function () {
                if (context.user.type() === 'individual') {
                    context.modal_flow.state('profile_individual');
                } else if (context.user.type() === 'institution') {
                    context.modal_flow.state('profile_institution');
                }
            });

        return self;
    };

    function build_individual (sel) {
        console.log('build individual');
        console.log(sel);
        var data = sel.datum();

        var first_row = sel.append('div')
                           .attr('class', 'row clearfix');

        console.log(first_row);

        var first_name = first_row
            .append('div')
            .attr('class', 'column one')
                .append('input')
                .attr('id', 'individual-first-name')
                .attr('data-mapped', 'first_name')
                .property('value',
                    data.objects[0].individual.first_name ?
                    data.objects[0].individual.first_name : ''
                );

        var last_name = first_row
            .append('div')
            .attr('class', 'column one')
                .append('input')
                .attr('id', 'individual-last-name')
                .attr('data-mapped', 'last_name')
                .property('value',
                    data.objects[0].individual.last_name ?
                    data.objects[0].individual.last_name : ''
                );

        var second_row = sel.append('div')
                            .attr('class', 'row clearfix');

        var email = second_row
            .append('div')
            .attr('class', 'column one')
                .append('input')
                .attr('id', 'individual-email')
                .attr('data-mapped', 'email')
                .property('value',
                    data.objects[0].individual.email ?
                    data.objects[0].individual.email : ''
                );

        var third_row = sel.append('div')
                           .attr('class', 'row clearfix');

        var geo_sel = third_row
            .append('div')
            .attr('class', 'column two')
            .attr('id', 'individual-email');

        var geo = geoComponent()
            .rootSelection(geo_sel)
            .optionsKey(function (d) { return d.country; })
            .initialValue(data.objects[0].top_level_input)
            .placeholder('00000');

        if (context.countries.data()) {
            // if the data is loaded already,
            // populate the select_geo module
            geo.options(context.countries.data())
                .render();
        } else {
            // wait until it is loaded, and then
            // render based on results
            context
                .countries
                    .dispatch
                    .on('loaded.profile', function () {

                geo.options(context.countries.data())
                    .render();
            });
        }

        var fourth_row = sel.append('div')
                            .attr('class', 'row clearfix');

        var work_in_sel = fourth_row
            .append('div')
            .attr('class', 'column two')
            .attr('id', 'individual-work-in');

        var work_in_options = [{
                    label: 'Research',
                    value: 'res',
                    selected: false
                }, {
                    label: 'Education',
                    value: 'edu',
                    selected: false
                }, {
                    label: 'Political',
                    value: 'pol',
                    selected: false
                }, {
                    label: 'Industry',
                    value: 'ind',
                    selected: false
                }];

        work_in_options.forEach(function (d, i) {
            if (d.label.toLowerCase() ===
                data.objects[0].work_in.toLowerCase()) {
                d.selected = true;
            }
        });

        var work_in = radioComponent()
            .node(work_in_sel)
            .label({
                label: 'I work in the following area',
                type: 'p',
                klass: ''
            })
            .groupName('individual-work-in-group')
            .data(work_in_options);
    }

    function build_institution (sel) {
        var first_row = sel.append('div').attr('row clearfix');
    }

    return self;
};