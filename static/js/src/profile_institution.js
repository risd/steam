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
        save_button,
        geo_options,
        data,
        prev_valid,
        valid;

    var name,
        representative_first_name,
        representative_last_name,
        representative_email,
        geo,
        work_in,
        description,
        updatable = updatableManager();

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

    self.build = function () {
        selection.datum(data).call(build);

        // they start with the same value,
        // depend on futher validation
        // or changes to the dom to enable
        // the save button.
        prev_valid = valid = true;

        validate();

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
                data.objects[0].institution.name ?
                data.objects[0].institution.name : '')
            .render();

        var representative_email_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega');

        representative_email = textComponent()
            .selection(representative_email_sel)
            .placeholder("representative's email")
            .initialValue(
                data.objects[0]
                    .institution
                    .representative_email ?
                data.objects[0]
                    .institution
                    .representative_email : '')
            .render();

        var representative_first_name_sel = sel
            .append('div')
            .attr('class', 'four-column-two');

        representative_first_name = textComponent()
            .selection(representative_first_name_sel)
            .placeholder("representative's first name")
            .initialValue(
                data.objects[0]
                    .institution
                    .representative_first_name ?
                data.objects[0]
                    .institution
                    .representative_first_name : '')
            .render();

        var representative_last_name_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega');

        representative_last_name = textComponent()
            .selection(representative_last_name_sel)
            .placeholder("representative's last name")
            .initialValue(
                data.objects[0]
                    .institution
                    .representative_last_name ?
                data.objects[0]
                    .institution
                    .representative_last_name : '')
            .render();

        var geo_sel = sel
            .append('div')
            .attr('class', 'four-column-four sel-geo')
            .attr('id', 'institution-geo');

        geo = geoComponent()
            .rootSelection(geo_sel)
            .validationVisual(false)
            .optionsKey(function (d) { return d.country; })
            .initialValue(data.objects[0].top_level_input)
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
                data.objects[0].work_in.toLowerCase()) {
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
            .initialSelected(work_in_initial)
            .data(work_in_options)
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
                data.objects[0].description ?
                data.objects[0].description : '')
            .render();

        save_button =
            sel.append('div')
                .attr('class', 'four-column-four')
                .append('p')
                .attr('class', 'large button')
                .text('Save');

        // turn on dispatch validation
        geo.dispatch
            .on('validChange.profile', function () {
                validate();
            })
            .on('valueChange.profile', function () {
                validate();
            });

        work_in.dispatch
            .on('valid.profile', function () {
                validate();
            });

        name.dispatch
            .on('valueChange.profile', function () {
                validate();
            });

        representative_first_name.dispatch
            .on('valueChange.profile', function () {
                validate();
            });

        representative_last_name.dispatch
            .on('valueChange.profile', function () {
                validate();
            });

        representative_email.dispatch
            .on('valueChange.profile', function () {
                validate();
            });

        description.dispatch
            .on('valueChange.profile', function () {
                validate();
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
            value: work_in.value,
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

    function decorate_for_submittal (x) {
        x.id = data.objects[0].id;
        x.resource_uri = data.objects[0].resource_uri;
        if (x.institution) {
            x.institution.id = data.objects[0].institution.id;
        }

        return x;
    }

    function update_user_data () {
        // something should be updated

        // updated data to be sent to
        // the server for saving
        var data_for_server = {};

        updatable.updated().forEach(function (n, i) {
            if (n.position_in_data.length === 1) {

                data.objects[0][n.position_in_data[0]] =
                    n.value();

                data_for_server[n.position_in_data[0]] =
                    n.value();

            } else if (n.position_in_data.length === 2) {

                data.objects[0][n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    n.value();

                // data for server may not have the correct
                // nested object to save against
                if (!data_for_server[n.position_in_data[0]]) {
                    data_for_server[n.position_in_data[0]] =
                        data.objects[0][n.position_in_data[0]];
                }

                data_for_server[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    n.value();
            }
            
        });
        // make those changes out
        // to the context.user module
        context.user.data(data);

        return data_for_server;
    }

    function save_flow () {
        var data_to_submit =
            decorate_for_submittal(update_user_data());

        // todo: stop editability

        context
            .api
            .steamie_update(data_to_submit,
                             function (err, response) {
            if (err){
                console.log('err');
                console.log(err);
                return;
            }
            
            console.log('do something with');
            console.log(response);

            var results = JSON.parse(response.responseText);
            console.log(results);

            updatable.resetInitialValues();
            // will reset the save button
            validate();
        });
    }

    function validate () {
        // deal with validation
        if (work_in.isValid() &&
            geo.isValid()) {
            valid = true;
        } else {
            valid = false;
        }

        // check to see if any of the
        // updatables, are updated.
        updatable.check();

        // determine button functionality
        // based on validation and 
        // updatable object status
        if (updatable.updated().length > 0) {
            if (valid) {
                enable_save();
            } else {
                disable_save();
            }
        } else {
            disable_save();
        }

        prev_valid = valid;

        return valid;
    }

    function enable_save() {
        save_button
            .classed('enabled', true)
            .on('click', function () {
                save_flow();
            });
    }

    function disable_save () {
        save_button
            .classed('enabled', false)
            .on('click', null);
    }

    return self;
};