var geoComponent =
        require('./formComponents/dropdownConditionalText'),
    radioComponent =
        require('./formComponents/radio'),
    textComponent =
        require('./formComponents/text'),
    textAreaComponent =
        require('./formComponents/textarea'),
    updatableManager =
        require('./formComponents/updatableManager');

module.exports = function ProfileIndividual (context) {
    var self = {},
        selection,
        save_button,
        geo_options,
        data;

    var first_name,
        last_name,
        email,
        geo,
        work_in,
        description,
        updatable = self.updatable = updatableManager();

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.data = function (x) {
        // local copy of user data
        if (!arguments.length) return data;
        data = x;
        return self;
    };

    self.decorate_for_submittal = function (x) {
        x.id = data.id;
        x.resource_uri = data.resource_uri;
        if (x.individual) {
            x.individual.id = data.individual.id;
        }

        return x;
    };

    self.build = function () {
        selection.datum(data).call(build);
        return self;
    };

    function build (sel) {

        var first_name_sel = sel
            .append('div')
            .attr('class', 'four-column-two');
        
        first_name = textComponent()
            .selection(first_name_sel)
            .placeholder('first name')
            .initialValue(
                data.individual.first_name ?
                data.individual.first_name : '')
            .render();

        var last_name_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega');

        last_name = textComponent()
            .selection(last_name_sel)
            .placeholder('last name')
            .initialValue(
                data.individual.last_name ?
                data.individual.last_name : '')
            .render();

        var geo_sel = sel
            .append('div')
            .attr('class', 'four-column-four sel-geo')
            .attr('id', 'individual-geo');

        geo = self.geo = geoComponent()
            .rootSelection(geo_sel)
            .validationVisual(false)
            .optionsKey(function (d) { return d.country; })
            .initialValue(data.top_level_input)
            .placeholder('zipcode');

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

        var work_in_sel = sel
            .append('div')
            .attr('class', 'four-column-two sel-work-in')
            .attr('id', 'individual-work-in');

        var work_in_options = [{
                    label: 'Research',
                    value: 'research',
                    selected: false
                }, {
                    label: 'Education',
                    value: 'education',
                    selected: false
                }, {
                    label: 'Policy',
                    value: 'political',
                    selected: false
                }, {
                    label: 'Industry',
                    value: 'industry',
                    selected: false
                }];

        var work_in_initial;
        work_in_options.forEach(function (d, i) {
            if (d.label.toLowerCase() ===
                data.work_in.toLowerCase()) {
                d.selected = true;
                work_in_initial = d;
            }
        });

        work_in = self.work_in = radioComponent()
            .node(work_in_sel)
            .label({
                label: 'I work in the following area',
                type: 'p',
                klass: ''
            })
            .groupName('individual-work-in-group')
            .data(work_in_options)
            .initialSelected(work_in_initial)
            .render();
        

        var description_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega steamie-description')
            .attr('id', 'individual-description');

        description = textAreaComponent()
            .selection(description_sel)
            .label({
                label: 'Why does STEAM matter to you?',
                type: 'p',
                klass: ''
            })
            .name('steamie-description')
            .initialValue(
                data.description ?
                data.description : '')
            .render();

        // turn on dispatch validation
        geo.dispatch
            .on('valueChange.profileIndividual', function () {
                self.validate();
            });

        work_in.dispatch
            .on('valid.profileIndividual', function () {
                self.validate();
            });

        first_name.dispatch
            .on('valueChange.profileIndividual', function () {
                self.validate();
            });

        last_name.dispatch
            .on('valueChange.profileIndividual', function () {
                self.validate();
            });

        description.dispatch
            .on('valueChange.profileIndividual', function () {
                self.validate();
            });

        // manage updatable items.
        updatable.add({
            isDifferent: first_name.isDifferent,
            value: first_name.value,
            position_in_data: ['individual', 'first_name'],
            reset_initial: first_name.initialValue
        });
        updatable.add({
            isDifferent: last_name.isDifferent,
            value: last_name.value,
            position_in_data: ['individual', 'last_name'],
            reset_initial: last_name.initialValue
        });
        updatable.add({
            isDifferent: work_in.isDifferent,
            value: work_in.selected,
            position_in_data: ['work_in'],
            reset_initial: work_in.initialSelected
        });

        // reset the initial value of geo manually
        // since it gets validated server side
        updatable.add({
            isDifferent: geo.isDifferent,
            value: geo.validatedData,
            position_in_data: ['top_level_input'],
            reset_initial: function () {}
        });
        updatable.add({
            isDifferent: description.isDifferent,
            value: description.value,
            position_in_data: ['description'],
            reset_initial: description.initialValue
        });
    }

    return self;
};