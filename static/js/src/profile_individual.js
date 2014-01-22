var geoComponent =
        require('./formComponents/dropdownConditionalText'),
    radioComponent =
        require('./formComponents/radio'),
    textComponent =
        require('./formComponents/text');

module.exports = function ProfileIndividual (context) {
    var self = {},
        selection,
        save_button,
        geo_options,
        data,
        prev_valid,
        valid;

    var first_name,
        last_name,
        email,
        geo,
        work_in;

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
        var data = sel.datum();

        var row = sel.append('div')
                           .attr('class', 'row clearfix');

        var first_name_sel = row
            .append('div')
            .attr('class', 'column one');
        
        first_name = textComponent()
            .selection(first_name_sel)
            .placeholder('first name')
            .initialValue(
                data.objects[0].individual.first_name ?
                data.objects[0].individual.first_name : '')
            .render();

        var last_name_self = row
            .append('div')
            .attr('class', 'column one');

        last_name = textComponent()
            .selection(last_name_self)
            .placeholder('last name')
            .initialValue(
                data.objects[0].individual.last_name ?
                data.objects[0].individual.last_name : '')
            .render();

        var geo_sel = row
            .append('div')
            .attr('class', 'column two')
            .attr('id', 'individual-geo');

        geo = geoComponent()
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

        var work_in_sel = row
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

        var work_in_initial;
        work_in_options.forEach(function (d, i) {
            if (d.label.toLowerCase() ===
                data.objects[0].work_in.toLowerCase()) {
                d.selected = true;
                work_in_initial = d;
            }
        });

        work_in = radioComponent()
            .node(work_in_sel)
            .label({
                label: 'I work in the following area',
                type: 'p',
                klass: ''
            })
            .groupName('individual-work-in-group')
            .initialSelected(work_in_initial)
            .data(work_in_options)
            .render();

        save_button =
            row.append('div')
                .attr('class', 'column two')
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

        first_name.dispatch
            .on('valueChange.profile', function () {
                validate();
            });

        last_name.dispatch
            .on('valueChange.profile', function () {
                validate();
            });
    }

    function get_data_from_dom () {
        // updates the data attribute to be sent
        // back to the server

        // individual not implemented:
        // url
        // institution
        // title
        // email
        // email subscription boolean

        data.objects[0].individual.first_name =
            first_name.value();

        data.objects[0].individual.last_name =
            last_name.value();

        data.objects[0].top_level_input =
            geo.validatedData();

        data.objects[0].work_in =
            work_in.selected();
    }

    function save_flow () {
        get_data_from_dom();
        context.user.data(data);

        // this works. need to figure
        // out how to actually implement.
        // what data needs to be sent?
        // just the updated data? can the
        // entire object be sent? just to the
        // using the PATCH attr?
        // looks do you have to call out specifically
        // the user and their resource URI?
        var test_user_data = context.user.data();

        test_user_data = {
            id: 23,
            resource_uri: '/api/v1/steamie/23',
            individual: {
                id: 6,
                first_name: 'Ruben'
            }
        };

        var test_data = {
            data_to_submit: test_user_data,
            steamie_id: 23
        };

        context
            .api
            .steamie_update(test_data,
                             function (err, response) {
            if (err){
                console.log('err');
                console.log(err);
            }
            
            console.log('do something with');
            console.log(response);

            console.log(JSON.parse(response.responseText));

            // will reset the save button
            validate();
        });

        first_name.initialValue(first_name.value());
        last_name.initialValue(last_name.value());
        work_in.initialSelected(work_in.selected());
        geo.initialValue(geo.validatedData());
    }

    function validate () {
        if (work_in.isValid() &&
            geo.isValid()) {
            valid = true;
        } else {
            valid = false;
        }

        if (first_name.isDifferent() ||
            last_name.isDifferent() ||
            work_in.isDifferent() ||
            geo.isDifferent()) {

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