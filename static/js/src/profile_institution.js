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

module.exports = function ProfileInstitution (context) {
    var self = {},
        selection,
        geo_options,
        data;

    var name,
        representative_first_name,
        representative_last_name,
        representative_email,
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
        if (x.institution) {
            x.institution.id = data.institution.id;
        }

        return x;
    };

    self.build = function () {
        selection.datum(data).call(build);
        return self;
    };

    function build (sel) {

        var name_sel = sel
            .append('div')
            .attr('class', 'four-column-two');
        
        name = textComponent()
            .selection(name_sel)
            .placeholder('institution name')
            .initialValue(
                data.institution.name ?
                data.institution.name : '')
            .render();

        var representative_email_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega');

        representative_email = textComponent()
            .selection(representative_email_sel)
            .placeholder("representative's email")
            .initialValue(
                data.institution
                    .representative_email ?
                data.institution
                    .representative_email : '')
            .render();

        var representative_first_name_sel = sel
            .append('div')
            .attr('class', 'four-column-two');

        representative_first_name = textComponent()
            .selection(representative_first_name_sel)
            .placeholder("representative's first name")
            .initialValue(
                data.institution
                    .representative_first_name ?
                data.institution
                    .representative_first_name : '')
            .render();

        var representative_last_name_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega');

        representative_last_name = textComponent()
            .selection(representative_last_name_sel)
            .placeholder("representative's last name")
            .initialValue(
                data.institution
                    .representative_last_name ?
                data.institution
                    .representative_last_name : '')
            .render();

        var geo_sel = sel
            .append('div')
            .attr('class', 'four-column-four sel-geo')
            .attr('id', 'institution-geo');

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
                    .on('loaded.profileInstitution', function () {

                geo.options(context.countries.data())
                    .render();
            });
        }

        var work_in_sel = sel
            .append('div')
            .attr('class', 'four-column-four sel-work-in')
            .attr('id', 'institution-work-in');

        var work_in_options = [{
                    label: 'Research',
                    value: 'research',
                    selected: false
                }, {
                    label: 'Education',
                    value: 'education',
                    selected: false
                }, {
                    label: 'Political',
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
                label: 'My institution works in the following area',
                type: 'p',
                klass: ''
            })
            .groupName('institution-work-in-group')
            .data(work_in_options)
            .initialSelected(work_in_initial)
            .render();

        var description_sel = sel
            .append('div')
            .attr('class', 'four-column-four steamie-description')
            .attr('id', 'institution-description');

        description = textAreaComponent()
            .selection(description_sel)
            .label({
                label: 'Why does STEAM matter to your institution?',
                type: 'p',
                klass: ''
            })
            .initialValue(
                data.description ?
                data.description : '')
            .render();

        // turn on dispatch validation
        geo.dispatch
            .on('valueChange.profileInstitution', function () {
                self.validate();
            });

        work_in.dispatch
            .on('valid.profileInstitution', function () {
                self.validate();
            });

        name.dispatch
            .on('valueChange.profileInstitution', function () {
                self.validate();
            });

        representative_first_name.dispatch
            .on('valueChange.profileInstitution', function () {
                self.validate();
            });

        representative_last_name.dispatch
            .on('valueChange.profileInstitution', function () {
                self.validate();
            });

        representative_email.dispatch
            .on('valueChange.profileInstitution', function () {
                self.validate();
            });

        description.dispatch
            .on('valueChange.profileInstitution', function () {
                self.validate();
            });

        // manage updatable items.
        updatable.add({
            isDifferent: name.isDifferent,
            value: name.value,
            position_in_data: ['institution',
                               'name'],
            reset_initial: name.initialValue
        });
        updatable.add({
            isDifferent: representative_first_name.isDifferent,
            value: representative_first_name.value,
            position_in_data: ['institution',
                               'representative_first_name'],
            reset_initial: representative_first_name.initialValue
        });
        updatable.add({
            isDifferent: representative_last_name.isDifferent,
            value: representative_last_name.value,
            position_in_data: ['institution',
                               'representative_last_name'],
            reset_initial: representative_last_name.initialValue
        });
        updatable.add({
            isDifferent: representative_email.isDifferent,
            value: representative_email.value,
            position_in_data: ['institution',
                               'representative_email'],
            reset_initial: representative_email.initialValue
        });
        updatable.add({
            isDifferent: work_in.isDifferent,
            value: work_in.selected,
            position_in_data: ['work_in'],
            reset_initial: work_in.initialSelected
        });
        updatable.add({
            isDifferent: geo.isDifferent,
            value: geo.validatedData,
            position_in_data: ['top_level_input'],
            reset_initial: geo.initialValue
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