(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var colors = {
    research: 'rgb(105,230,64)',
    political: 'rgb(255,97,127)',
    education: 'rgb(255,137,49)',
    industry: 'rgb(39,180,242)'
};

if (typeof module !== 'undefined') {
    exports = module.exports = colors;
} else {
    window.colors = colors;
}
},{}],2:[function(require,module,exports){
module.exports = filterUI;

// UI for manipulating data
function filterUI (context) {

    var ui = {},
        active_count = 4,
        prev_active_count,
        clicked = 0,
        collapsed = false,
        filterable = true;

    var filter_bar = d3.select('.filter-bar'),
        filter_bar_header = d3.select('.filter-bar-header'),
        filter_collapsable_visual = d3.select('.filter-bar .collapse');

    ui.filter_bar = filter_bar;

    ui.filterable = function (x) {
        if (!arguments.length) return filterable;
        filterable = x;
        return ui;
    };

    ui.init = function () {
        filter_bar.classed('all-active', true);
        filter_bar_header
            .on('click', function () {
                collapsed = collapsed ? false : true;
                filter_bar.classed('collapse', collapsed);
            });

        var filter_buttons = filter_bar.selectAll('.button')
            .data(context.filters)
            .enter()
            .append('div')
            .attr('class', function (d) {
                return 'button active ' + d.value;
            })
            .html(function (d) {
                return  "<span class='indicator'></span>" +
                    "<span class='label'>" + d.display + "</span>";
            });

        if (filterable) {
            filter_buttons
            .on('click', function (d) {

                prev_active_count = active_count;
                context.prev_filters = context.clone(context.filters);

                if (prev_active_count === 4) {
                    // all filters were active
                    // set only one filter to active
                    var i;
                    // reset active count to get an 
                    // update as we loop through filters
                    active_count = 0;
                    for (i=0; i < context.filters.length; i++) {
                        // set the active attribute
                        // of filters based on click
                        if (context.filters[i].value === d.value) {
                            context.filters[i].active = 1;
                            active_count += 1;
                        } else {
                            context.filters[i].active = 0;
                            filter_bar
                                .select('.button.' +
                                        context.filters[i].value)
                                .classed('active', false);
                        }
                    }

                } else if (prev_active_count === 1) {
                    // one filter was active

                    if (d.active) {
                        // if that one active filter, is the
                        // on that was just pressed, reactivate
                        // all of the filters

                        filter_bar
                            .selectAll('.button')
                            .classed('active', true);

                        var i;
                        active_count = 0;
                        for (i=0; i < context.filters.length; i++) {
                            context.filters[i].active = 1;
                            active_count += 1;
                        }

                    } else {
                        // if the one active filter is NOT the
                        // one that was just pressed, add
                        // the newly clicked filter as active too
                        
                        var i;
                        for (i=0; i < context.filters.length; i++) {

                            if (context.filters[i].value === d.value) {
                                context.filters[i].active = 1;
                                active_count += 1;
                            }
                        }

                        d3.select(this)
                            .classed('active', d.active);

                    }
                } else {
                    // subsequent clicks add or remove based
                    // on active state

                    // toggle state
                    d.active = d.active ? 0 : 1;

                    if (d.active) {
                        active_count += 1;
                    } else {
                        active_count -= 1;
                    }

                    // toggle visual
                    d3.select(this)
                        .classed('active', d.active);
                }

                if (active_count === 4) {
                    filter_bar
                        .classed('all-active', true);
                } else {
                    filter_bar
                        .classed('all-active', false);
                }

                // apply filter to network and map
                context.network.filter();
                context.clusters.filter();
            });
        }
    };

    return ui;
}
},{}],3:[function(require,module,exports){
var filters = [{
        value: 'research',
        display: 'research',
        active: 1
    }, {
        value: 'education',
        display: 'education',
        active: 1
    }, {
        value: 'political',
        display: 'policy',
        active: 1
    }, {
        value: 'industry',
        display: 'industry',
        active: 1
    }];

if (typeof module !== 'undefined') {
    exports = module.exports = filters;
} else {
    window.filters = filters;
}
},{}],4:[function(require,module,exports){
var textComponent = require('./text'),
    Checkmark = require('../ui/checkmark');

module.exports = function dropdownConditionalText () {
    var self = {},
        valid = false,
        root_selection,
        text_selection,
        editable_text,
        checkmark_sel,
        checkmark_bool = true,
        options,
        options_key,
        select_wrapper,
        select,
        select_options,
        placeholder,
        initial_value,
        rendered = false;

    self.dispatch = d3.dispatch('valueChange');

    self.isValid = function () {
        return validate();
    };

    self.validationVisual = function (x) {
        if (!arguments.length) return checkmark_bool;
        checkmark_bool = x;
        return self;
    };

    self.validatedData = function () {
        // if the editable text selection is
        // active, then you are looking at
        // something in the US, and should
        // return the value of the text field

        // otherwise, get the value from the drop down
        // to send back to the server
        if (text_selection.classed('active')) {
            return editable_text.value();
        } else {
            select.property('value');
        }
    };

    self.initialValue = function (x) {
        if (!arguments.length) return initial_value;
        initial_value = x;
        return self;
    };

    self.updateDOM = function () {
        update_visual_display();
        return self;
    };

    self.isDifferent = function () {
        if (self.initialValue() === self.validatedData()){
            return false;
        } else {
            return true;
        }
    };


    self.rootSelection = function (x) {
        if (!arguments.length) return root_selection;
        root_selection = x;
        return self;
    };

    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return self;
    };

    self.options = function (x) {
        if (!arguments.length) return options;
        options = x;

        if (options[options.length-1].country === '') {
            options.pop();
        }

        return self;
    };

    // function that gets values out of the options array
    self.optionsKey = function (x) {
        if (!arguments.length) return options_key;
        options_key = x;
        return self;
    };

    self.render = function () {
        // set the initial values for rendering
        var render_args = args_for_rendering();

        // add validation visualization
        if (checkmark_bool) {
            root_selection
                .call(Checkmark());
            checkmark_sel = root_selection.select('.checkmark');
        }

        select_wrapper =
            root_selection
                .append('div')
                .attr('class', 'input-select');

        text_selection =
            root_selection
                .selectAll('.input-text')
                .data(render_args.text_selection_data)
                .enter()
                .append('div');

        text_selection
                .attr('class', function (d) {
                    var active = d.active ? ' active' : '';
                    return 'input-text hide-til-active' + active;
                });


        editable_text = textComponent()
                            .selection(text_selection)
                            .placeholder(placeholder)
                            .initialValue(render_args.editable_text)
                            .valid(function (val) {
                                // only accepts 5 digit
                                // zipcode as a valid one
                                if (val.length === 5) {
                                    return true;
                                } else {
                                    return false;
                                }
                            })
                            .render();

        editable_text
            .dispatch
            .on('valueChange.dropdownConditionalText', function () {
                self.dispatch.valueChange.apply(this, arguments);
            });


        select = select_wrapper
            .append('select')
            .on('change', function () {
                if (select.property('value') ===
                    'United States of America') {

                    text_selection
                        .classed('active', true);
                } else {
                    text_selection
                        .classed('active', false);
                }
                validate();

                self.dispatch.valueChange.apply(this, arguments);
            });

        select
            .selectAll('option')
            .data(options)
            .enter()
            .append('option')
            .attr('value', options_key)
            .text(options_key)
            .property('value', options_key);

        // select initial
        select.property('value', render_args.value_selected);

        // set state based on render
        validate();

        rendered = true;

        return self;
    };

    function validate () {
        if ((editable_text.valid() &&
             text_selection.classed('active')) ||
            (text_selection.classed('active') === false)) {

            valid = true;
        } else {
            valid = false;
        }

        if (checkmark_bool) {
            checkmark_sel.classed('valid', valid);
        }

        return valid;
    }

    function args_for_rendering () {
        // based on an initial value, there are
        // three arguments needed for rendering
        // this component

        // defaults assume a zipcode is present
        var args = {
            text_selection_data: [{
                active: true
            }],
            editable_text: initial_value,
            value_selected: 'United States of America'
        };

        options.forEach(function (d, i) {
            if (d.country === 'United States of America') {
                return;
            }

            // 
            if (initial_value === d.country) {

                args.text_selection_data = [{
                    active: false
                }];

                args.editable_text = '';

                args.value_selectd = d.country;
            }
        });

        return args;
    }

    function update_visual_display () {
        var args = args_for_rendering();

        text_selection
            .selectAll('.input-text')
            .data(args.text_selection_data);

        text_selection
            .attr('class', function (d) {
                var active = d.active ? ' active' : '';
                return 'input-text hide-til-active' + active;
            });

        editable_text.value(args.editable_text);

        select.property('value', args.value_selected);
    }

    return self;
};
},{"../ui/checkmark":16,"./text":7}],5:[function(require,module,exports){
module.exports = function radioSelection () {
    var self = {},
        valid = false,
        selected = false,
        // parent node where options will be appended
        node,
        group_name,
        label,
        data = [],
        initial_selected = {
            value: undefined,
            selected: undefined,
            label: undefined
        };

    self.dispatch = d3.dispatch('valid',
                                'valueChange',
                                'valueDifferent');

    self.render = function () {
        // must call node(x) to
        // define a node before
        // calling .render()

        if (label) {
            node.append(label.type)
                .text(label.label)
                .attr('class', label.klass);
        }

        if (initial_selected) {
            selected = initial_selected;
        }

        var sel = node
            .selectAll('.type-option')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'type-option ')
            .on('mouseup.radio', function (d) {
                d3.event.stopPropagation();

                d3.select(this)
                    .select('input')
                    .node().checked = true;

                self.selected(d);
                
                valid = true;
                self.dispatch.valid.apply(this, arguments);
                self.dispatch.valueChange.apply(this, arguments);

                if (self.isDifferent()) {
                    self.dispatch
                        .valueDifferent.apply(this, arguments);
                    
                }
            })
            .call(addInput);

        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
        return self;
    };

    self.node = function (x) {
        if (!arguments.length) return node;
        node = x;
        return self;
    };

    self.data = function (x) {
        if (!arguments.length) return data;
        data = x;

        // if there is an initially
        // selected element, make the
        // object aware of it
        var initial;
        data.forEach(function (d, i) {
            if (d.selected === true) {
                initial = d;
            }
        });
        self.initialSelected(initial);

        return self;
    };

    self.groupName = function (x) {
        if (!arguments.length) return group_name;
        group_name = x;
        return self;
    };

    self.isValid = function () {
        return valid;
    };

    self.isDifferent = function () {
        console.log('initial ', self.initialSelected());
        console.log('selected ', self.selected());
        // compare initial_selected (entire object)
        // against the selected() function,
        // which manages the data objects
        // and only returns the .value attr of
        // the selected item
        if (self.initialSelected()) {
            if (self.initialSelected() !==
                self.selected()) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    };

    self.initialSelected = function (x) {
        // must have a data object to reference
        if (!arguments.length) return initial_selected.value;

        if (typeof(x) === 'string') {
            data.forEach(function (n, i) {
                if (x === n.value) {
                    initial_selected = n;
                }
            });
        } else if (typeof(x) === 'object') {
            // its an object?
            data.forEach(function (n, i) {
                if (x.value === n.value) {
                    initial_selected = n;
                }
            });
        }

        return self;
    };

    self.selected = function (x) {
        // must have a data object to reference
        if (!arguments.length) return selected.value;

        if (typeof(x) === 'string') {
            data.forEach(function (n, i) {
                if (x === n.value) {
                    selected = n;
                    n.selected = true;
                } else {
                    n.selected = false;
                }
            });
        } else if (typeof(x) === 'object') {
            data.forEach(function (n, i) {
                if (x.value === n.value) {
                    selected = n;
                    n.selected = true;
                } else {
                    n.selected = false;
                }
            });
        }

        return selected;
    };

    function addInput (sel) {

        sel.append('input')
            .attr('type', 'radio')
            .attr('class', 'checkbox')
            .attr('name', group_name)
            .attr('id', function (d, i) {
                return 'type-option-' + d.value;
            })
            .property('checked', function (d) {
                if (d.selected) {
                    valid = true;
                }
                return d.selected;
            });

        var label_sel = sel.append('label')
            .attr('class', 'type-option-label')
            .attr('for', function (d, i) {
                return 'type-option-' + d.value;
            });

        label_sel
            .append('span')
            .attr('class', 'text')
            .text(function (d, i) {
                return d.label;
            });

        label_sel
            .append('span')
            .attr('class', 'indicator')
            .append('span')
            .attr('class', 'fill');
    }

    return self;
};
},{}],6:[function(require,module,exports){
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
},{"../ui/checkmark":16}],7:[function(require,module,exports){
// text input, with placeholder
// dispatches when the value changes
// against the initial value

// there is no idea of validity,
// just whether or not a value
// has changed.
module.exports = function TextInput () {
    var self = {},
        selection,
        input_selection,
        placeholder,
        value,
        initial_value,
        valid_function = function (val) { return true; };

    self.dispatch = d3.dispatch('valueChange');

    self.render = function () {

        input_selection = selection
            .append('input')
            .attr('placeholder', placeholder)
            .property('value', initial_value);

        input_selection
            .on('keyup.internal-text', function (d) {
                self.dispatch.valueChange.apply(this, arguments);
            });

        return self;
    };



    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return self;
    };

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.initialValue = function (x) {
        if (!arguments.length) return initial_value;
        initial_value = x;
        return self;
    };

    self.value = function (x) {
        if (!arguments.length) {
            return input_selection.property('value');
        }
        input_selection.property('value', x);
        return self;
    };

    self.isDifferent = function () {
        if (self.value() !== initial_value) {
            return true;
        } else {
            return false;
        }
    };

    self.isNotEmpty = function () {
        if (self.value() &&
            self.value().length > 0) {
            return true;
        } else {
            return false;
        }
    };

    self.valid = function (x) {
        if (!arguments.length) {
            return valid_function(self.value());
        }
        // pass in a function that will validate
        // this text box
        valid_function = x;
        return self;
    };

    return self;
};
},{}],8:[function(require,module,exports){
// textarea, with placeholder, and label
// dispatches when the value changes
// against the initial value

// there is no idea of validity,
// just whether or not a value
// has changed.
module.exports = function TextArea () {
    var self = {},
        selection,
        area_selection,
        placeholder = '',
        label,
        value,
        initial_value = '',
        name = '';

    self.dispatch = d3.dispatch('valueChange');

    self.render = function () {

        if (label) {
            selection.append(label.type)
                .text(label.label)
                .attr('class', label.klass)
                .attr('for', name);
        }

        area_selection = selection
            .append('textarea')
            .attr('placeholder', placeholder)
            .attr('name', name)
            .property('value', initial_value)
            .on('keyup.internal-text', function (d) {
                self.dispatch.valueChange.apply(this, arguments);
            });

        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
        return self;
    };

    self.name = function (x) {
        if (!arguments.length) return name;
        name = x;
        return self;
    };

    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return self;
    };

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.initialValue = function (x) {
        if (!arguments.length) return initial_value;
        initial_value = x;
        return self;
    };

    self.value = function (x) {
        return area_selection.node().value;
    };

    self.isDifferent = function () {
        if (self.value() !== initial_value) {
            return true;
        } else {
            return false;
        }
    };

    return self;
};
},{}],9:[function(require,module,exports){
var svg_cross = require('./svg/svgCross'),
    svg_force = require('./svg/buttonForce'),
    svg_list = require('./svg/buttonList');

module.exports = Network;

// Network graph
function Network (context) {

    var network = {},
        height,
        width,
        canvas_wrapper = d3.select('#steamie-network'),
        canvas,
        nodes,
        force,
        node_sel,
        info_tip_sel,
        canvas_blanket_sel,
        fixed_grid_sel,
        overflow_grid_sel,
        // name of the overlay
        title,
        grid_wrapper_sel,
        list_col_sel,
        request,
        built = false,
        highlighted = false,
        transition = false,
        render_svg = true,
        network_display = 'force',
        prev_network_display = 'force',
        network_options = ['force', 'list'],
        network_create = {
            'force': force_create,
            'list': list_create
        },
        network_filter = {
            'force': force_filter,
            'list': list_filter
        },
        network_highlight = {
            'force': force_highlight,
            'list': list_highlight
        },
        network_transition = {
            'force': {
                'list': transition_force_to_list
            },
            'list': {
                'force': transition_list_to_force
            }
        };

    var dispatch = d3.dispatch('create');

    var random_around_zero = function (range) {
        var val = Math.floor(Math.random() * range);
        if (Math.random() > 0.5) {
            return val;
        } else {
            return -val;
        }
    };

    var gravity = 0.1,
        friction = 0.9,
        charge = -30,
        radius_outter = 4.5,
        radius_inner = 2,
        scale = {
            defaulted: 1,
            unselected: 0.666666667,
            selected: 1.333333333
        },
        opacity = {
            defaulted: 1,
            unselected: 0.15,
            selected: 1
        };

    network.filter = function () {
        network_filter[network_display]();
        

        return network;
    };

    network.nodes = function (x) {
        if(!arguments.length) return nodes;

        nodes = x;

        return network;
    };

    network.renderSvg = function (x) {
        if(!arguments.length) return render_svg;

        render_svg = x;

        return network;
    };

    network.title = function (x) {
        if(!arguments.length) return title;
        if (x.us_bool) {
            if (x.us_district === 0) {
                title = x.us_state;
            } else {
                title = x.us_state + ' <em>' +
                    x.us_district_ordinal +
                    ' District</em>';
            }
        } else {
            title = x.country;
        }

        return network;
    };

    network.create = function () {

        if (built) {
            network.remove();
        }

        // create divs
        canvas = canvas_wrapper
                    .classed('active', true)
                    .append('svg')
                    .attr('class', 'canvas')
                    .attr('width', width)
                    .attr('height', height);

        fixed_grid_wrapper_sel = canvas_wrapper
            .append('div')
                .attr('class', 'header-wrapper');

        overflow_grid_wrapper_sel = canvas_wrapper
            .append('div')
                .attr('class', 'list-wrapper');

        fixed_grid_sel = fixed_grid_wrapper_sel
            .append('div')
                .attr('class', 'grid full-width clearfix');

        overflow_grid_sel = overflow_grid_wrapper_sel
            .append('div')
                .attr('class', 'overflow grid full-width clearfix');

        var four_col_sel = fixed_grid_sel
            .append('div')
                .attr('class', 'four-column clearfix offset-one');

        four_col_sel
            .append('h3')
                .html(title);

        four_col_sel
            .append('div')
                .attr('class', 'close-button tablet ' +
                               'modal-header-button')
            .on('click', function () {
                network.remove();
            })
            .call(svg_cross);

        fixed_grid_sel
            .append('div')
                .attr('class', 'one-column omega')
            .append('div')
                .attr('class', 'close-button desktop')
                .on('click', function () {
                    network.remove();
                })
                .call(svg_cross);

        var buttons_sel = fixed_grid_sel
            .append('div')
                .attr('class', 'four-column offset-one '+
                               'network-button-wrapper clearfix');
        var buttons = buttons_sel
            .selectAll('.network-display-button')
            .data([{
                klass: 'force',
                click: function () {
                    network.display('force')
                        .transition();
                },
                html: svg_force
            }, {
                klass: 'list',
                click: function () {
                    network.display('list')
                        .transition();
                },
                html: svg_list
            }])
            .enter()
            .append('a')
            .attr('class', function (d) {
                return 'network-display-button ' + d.klass;
            })
            .on('click', function (d) {
                d.click();
            })
            .html(function (d) { return d.html; });

        // end create divs

        network_create[network_display]();
        
        built = true;
        dispatch.create();

        return network;
    };

    network.display = function (x) {
        if (!arguments.length) return network_display;
        prev_network_display = network_display;
        network_display = x;
        return network;
    };

    network.remove = function () {
        // no draw on the map
        // d3.select('#steam-map').classed('active', true);

        // deactivate wrapper
        canvas_wrapper.classed('active', false);

        d3.transition()
            .duration(300)
            .each(function () {
                // remove svg
                d3.transition(canvas)
                    // .delay(300)
                    .remove();

                // remove all nodes from the graph
                d3.transition(nodes_sel.data([]).exit())
                    .style('opacity', 0)
                    .remove();

                d3.transition(overflow_grid_sel)
                    .remove();
                d3.transition(fixed_grid_wrapper_sel)
                    .remove();


            });

        // these wont be set until after
        // a network has been initialized
        // and a node has been clicked
        if (info_tip_sel) {
            remove_info_tip();
        }
        if (canvas_blanket_sel) {
            canvas_blanket_sel.remove();
        }

        built = false;

        return network;
    };

    network.highlight = function (data) {
        // data = { steamie_id: , tlg_id: , steamie_type: }
        network.init(data);

        dispatch.on('create.highlight', function () {
            var highlight_sel = nodes_sel.filter(function (d,i) {
                if (d[data.steamie_type]) {
                    return d[data.steamie_type].id ===
                            data.steamie_id;
                }
            });
            highlight_sel.each(highlight);

            // reset the dispatch;
            dispatch.on('create.highlight', null);
        });
    };

    network.transition = function () {
        if (prev_network_display === network_display) return;

        network_transition
            [prev_network_display]
            [network_display]();
    };

    network.init = function (data) {
        // used to initialize a network graph
        // data is passed in from the cluster
        // group that is clicked.
        if (request) {
            request.abort();
        }

        request = context.api
            .network_request(data.tlg_id, function (err, results) {
                console.log('returned data');
                console.log(results);
                network
                      .nodes(results.steamies)
                      .title((results.us_bool ?
                              {
                                us_bool: results.us_bool,
                                us_state: results.us_state,
                                us_district:
                                    results.us_district,
                                us_district_ordinal:
                                    results.us_district_ordinal
                              } :
                              {
                                us_bool: results.us_bool,
                                country: results.country
                              }))
                      .create();
            });
    };

    function blanket_interaction () {
        nodes_sel.transition()
            .duration(500)
            .style('opacity', set_opacity);

        if (arguments.length) {
            d3.select(this).remove();
        }

        remove_info_tip();
    }

    function remove_info_tip () {
        info_tip_sel.data([])
            .exit()
            .remove();
        highlighted = false;
    }

    function transform (d) {
        return 'translate(' + d.x + ',' + d.y + ') ' +
               'scale(' + scale[d.status] + ')';
    }
    function set_opacity (d) {
        return opacity[d.status];
    }
    function set_opacity_solo (d) {
        return opacity[d.solo_selected_status];
    }

    function add_symbols (sel) {

        var industry = sel.filter(function (d) {
            // looking for groups/industries
            return d.type === 'institution';
        });

        // all g.node elements.
        sel.append('circle')
            .attr('class', 'outter')
            .attr('r', radius_outter)
            .attr('cx', radius_outter)
            .attr('cy', radius_outter);

        industry.append('circle')
            .attr('class', 'inner')
            .attr('r', radius_inner)
            .attr('cx', radius_outter)
            .attr('cy', radius_outter);
    }

    function active (d) {
        // returns true if active
        // returns false if blurred
        var status = false,
            i;

        for (i=0; i < context.filters.length; i++) {
            if (context.filters[i].value === d.work_in) {

                if (context.filters[i].active) {

                    return true;
                }
            }
        }
        return false;
    }

    function update_info_tip (sel) {
        sel.append('img')
            .attr('class', 'avatar')
            .attr('src', steamie_avatar);

        var inner_div = sel.append('div')
                           .attr('class', 'user_info');

        inner_div.append('p')
            .attr('class', 'name')
            .text(steamie_name);

        inner_div.append('p')
            .attr('class', 'description')
            .text(steamie_description);
    }

    function highlight (d, i) {
        var highlight_sel = d3.select(this);

        // clear user data
        if (info_tip_sel) {
            remove_info_tip();
        }

        // reset value that will be used
        // to set the opacity
        nodes_sel.each(function (nd) {
            nd.solo_selected_status = 'unselected';
        });
        d.solo_selected_status = 'selected';

        // set opacity based on above value
        nodes_sel
            .transition()
            .duration(500)
            .style('opacity', set_opacity_solo);

        network_highlight[network_display](d, i, highlight_sel);

        highlighted = true;
    }

    function force_highlight (d, i, highlight_sel) {


        var infotip_position = new Array(2);

        if (d.y < (window.innerHeight/2)) {
            infotip_position[1] = {
                offset_from: 'top',
                offset_distance: d.y + 20,
                offset_reset: 'bottom',
                offset_reset_value: 'auto'
            };
        } else {
            infotip_position[1] = {
                offset_from: 'bottom',
                offset_distance: window.innerHeight -
                                 d.y,
                offset_reset: 'top',
                offset_reset_value: 'auto'
            };
        }

        // show user data
        info_tip_sel =
            canvas_wrapper
                .selectAll('.info_tip')
                .data([d])
                .enter()
                .append('div')
                .attr('class', function (d) {
                    return 'info_tip z-200 ' + d.work_in;
                })
                .style('left', d.x + 'px')
                .style(infotip_position[1]
                                .offset_from,
                       infotip_position[1]
                                .offset_distance +
                       'px')
                .style(infotip_position[1]
                                .offset_reset,
                       infotip_position[1]
                                .offset_reset_value)
                .call(update_info_tip);

        // add blanket
        canvas_blanket_sel =
            canvas.insert('rect', 'g:first-child')
                .attr('class', 'blanket')
                .attr('height', height)
                .attr('width', width)
                .attr('x', 0)
                .attr('y', 0)
                .on('click', blanket_interaction);

    }

    function list_highlight (d, i, highlight_sel) {
        // show highlighted first

        canvas_blanket_sel =
            grid_wrapper_sel.append('div')
                .attr('class', 'blanket')
                .on('click', blanket_interaction);
    }

    function force_coordinates (x) {
        // x:   all nodes
        x.forEach(function (d, i) {

            d.x = width/2 + random_around_zero(30);
            d.y = height/2 + random_around_zero(30);
            // define px for more 'splosion
            // d.px = width/2;
            // d.py = height/2;

            // setup type
            d = node_add_type(d);
        });
        return x;
    }

    function node_add_type (x) {
        if (x.individual) {
            x.type = 'individual';
        } else if (x.institution) {
            x.type = 'institution';
        } else {
            x.type = '';
        }
        return x;
    }

    function gravity_based_on_node_count (count) {
        // set gravity of force based on the
        // number of nodes
        var g = 0.1;
        if (count > 500 &
            count <= 800) {

            g = 0.2;
        }
        else if (count > 800 &
            count <= 1100) {

            g = 0.3;
        }
        else if (count > 800 &
            count <= 1100) {

            g = 0.4;
        }
        else if (count > 1100 &
            count <= 2000) {

            g = 0.5;
        } else if (count > 2000) {
            // greater than 2000
            g = 0.6;
        }
        return g;
    }

    function force_create () {
        // create force graph
        width = window.innerWidth;
        height = window.innerHeight;

        // hide the list grid
        overflow_grid_wrapper_sel
            .style('top', '-200%');

        gravity = gravity_based_on_node_count(nodes.length);
        
        nodes = force_coordinates(nodes);

        force = d3.layout.force()
            .friction(friction)
            .charge(charge)
            .gravity(gravity)
            .size([width, height])
            .links([])
            .nodes(nodes);

        nodes_sel = canvas.selectAll('.node')
                .data(nodes)
            .enter()
            .append('g')
                .attr('class', function (d) {
                    return 'node ' +
                            d.work_in + ' ' +
                            d.type;
                })
                .call(update_node_status)
                .style('opacity', set_opacity)
                .attr('transform', transform)
                .call(force.drag)
                .on('click', highlight)
                .call(add_symbols);

        force.start();
        force.on('tick', function () {
            nodes_sel
                .attr('transform', transform);
        });
    }

    function list_create () {

        // show the list wrapper
        overflow_grid_wrapper_sel
            .style('top', '0');

        var svg_dimensions = ((radius_outter * 2) * scale['selected']);

        list_col_sel = overflow_grid_sel.append('div')
            .attr('class', 'four-column clearfix offset-one');

        nodes_sel = list_col_sel.selectAll('.steamie')
            .data(nodes)
            .enter()
            .append('div')
            .each(function (d, i) {
                d.x = 0;
                d.y = 0;
            })
            .call(update_node_status)
            .attr('class', function (d) {
                return 'steamie four-column-two offset-one ' +
                        d.work_in;
            });

        if (render_svg) {
            nodes_sel.append('svg')
                .attr('width', svg_dimensions)
                .attr('height', svg_dimensions)
                .append('g')
                    .attr('class', function (d) {
                        return 'node ' +
                                d.work_in + ' ' +
                                d.type;
                    })
                    .style('opacity', set_opacity)
                    .attr('transform', transform)
                    .call(add_symbols);
        }

        nodes_sel.append('img')
            .attr('class', 'avatar')
            .attr('src', steamie_avatar);

        var inner_div = nodes_sel.append('div')
                           .attr('class', 'user_info');

        inner_div.append('p')
            .attr('class', 'name')
            .text(steamie_name);

        inner_div.append('p')
            .attr('class', 'description')
            .text(steamie_description);
    }

    function list_filter () {
        try {
            update_node_status();

            nodes_sel.each(function (d, i) {
                d.x = 0;
                d.y = 0;
            });

            nodes_sel
                .selectAll('g.node')
                .transition()
                .duration(800)
                .style('opacity', set_opacity)
                .attr('transform', transform);

        } catch (e) {
            console.log('Can not filter the non non-existent list');
        }
    }

    function force_filter () {
        try {
            // only include/exclude if there is
            // an instance of nodes having been
            // selected

            update_node_status();

            nodes_sel
                .transition()
                .duration(800)
                .style('opacity', set_opacity)
                .attr('transform', transform);

        } catch (e) {
            console.log(
                'Can not filter the non-existent network.');
        }
    }

    function steamie_name (d) {
        var name;
        if (d.individual) {
            name = (d.individual.first_name || '') + ' ' +
               (d.individual.last_name || '');
        } else if (d.institution) {
            name = (d.institution.name || '');
        } else {
            name = '';
        }
        return name;
    }

    function steamie_description (d) {
        return d.description;
    }

    function steamie_avatar (d) {
        return d.avatar_url;
    }

    function update_node_status (sel) {
        if (!arguments.length) sel = nodes_sel;
        var active_count = 0;
        for (var i = context.filters.length - 1; i >= 0; i--) {
            if (context.filters[i].active) {
                active_count += 1;
            }
        }

        if (active_count === 4) {
            // reset all to defaulted
            sel.each(function (d) {
                d.status = 'defaulted';
            });

        } else {

            sel
                .each(function (d) {
                    if (active(d)) {
                        d.status = 'selected';
                    } else {
                        d.status = 'unselected';
                    }
                });
        }
    }

    function transition_list_to_force () {
        transition = true;
        nodes_sel.each(function (d, i) {
            var sel = d3.select(this);
            var svg = sel.select('svg');
            svg_padding = parseInt(
                svg.style('padding').split('px', 1)[0],
                10);
            svg_pos = svg.node().getBoundingClientRect();
            d.y = svg_pos.top + svg_padding;
            d.py = svg_pos.top + svg_padding;
            d.x = svg_pos.left + svg_padding;
            d.px = svg_pos.left + svg_padding;
        });

        nodes = nodes_sel.data();

        // create
        width = window.innerWidth;
        height = window.innerHeight;

        gravity = gravity_based_on_node_count(nodes.length);

        force = d3.layout.force()
            .friction(friction)
            .charge(charge)
            .gravity(gravity)
            .size([width, height])
            .links([])
            .nodes(nodes)
            .stop();

        nodes_sel = canvas.selectAll('.node')
                .data(nodes)
            .enter()
            .append('g')
                .attr('class', function (d) {
                    return 'node ' +
                            d.work_in + ' ' +
                            d.type;
                })
                .style('opacity', set_opacity)
                .attr('transform', transform)
                .call(force.drag)
                .on('click', highlight)
                .call(add_symbols);

        force.on('tick', function () {
            nodes_sel
                .attr('transform', transform);
        });
        // end create

        d3.transition()
            .duration(800)
            .each(function () {
                d3.transition(list_col_sel)
                    .style('opacity', 0)
                    .remove();
                
                d3.transition(canvas)
                    .style('opacity', 1);

            }).each('end', function () {
                force.start()
                    .alpha(0.2);
                overflow_grid_wrapper_sel
                    .style('top', '-200%');
            });

        transition = false;
    }

    function transition_force_to_list () {
        transition = true;

        // put the list selection in the place
        // where it will be populated;
        overflow_grid_wrapper_sel
            .style('top', '0');

        // if its there, remove it
        if (highlighted) {
            blanket_interaction();
        }

        
        // list create
        var svg_dimensions = ((radius_outter * 2) * scale['selected']);

        list_col_sel = overflow_grid_sel.append('div')
            .attr('class', 'four-column clearfix offset-one');

        if (transition) {
            list_col_sel.style('opacity', 0);
        }

        var temp_nodes_sel = list_col_sel.selectAll('.steamie')
            .data(nodes)
            .enter()
            .append('div')
            .each(function (d, i) {
                d.x = 0;
                d.y = 0;
            })
            .attr('class', function (d) {
                return 'steamie four-column-two offset-one ' +
                        d.work_in;
            });

        temp_nodes_sel.append('svg')
            .attr('width', svg_dimensions)
            .attr('height', svg_dimensions)
            .append('g')
                .attr('class', function (d) {
                    return 'node ' +
                            d.work_in + ' ' +
                            d.type;
                })
                .style('opacity', set_opacity)
                .attr('transform', transform)
                .call(add_symbols);

        temp_nodes_sel.append('img')
            .attr('class', 'avatar')
            .attr('src', steamie_avatar);

        var inner_div = temp_nodes_sel.append('div')
                           .attr('class', 'user_info');

        inner_div.append('p')
            .attr('class', 'name')
            .text(steamie_name);

        inner_div.append('p')
            .attr('class', 'description')
            .text(steamie_description);
        // end list create

        var destinations = [];
        temp_nodes_sel.each(function (d, i) {
            var sel = d3.select(this);
            var svg = sel.select('svg');
            svg_padding = parseInt(
                svg.style('padding').split('px', 1)[0],
                10);
            svg_pos = svg.node().getBoundingClientRect();

            destinations.push({
                x: svg_pos.left + svg_padding,
                y: svg_pos.top + svg_padding,
                i: i,
                d: d
            });
        });

        nodes_sel.each(function (fd, fi) {
            for (var i = destinations.length - 1; i >= 0; i--) {

                if (fi === destinations[i].i) {
                    fd.dx = destinations[i].x;
                    fd.dy = destinations[i].y;

                    fd.interpolateX = d3.interpolate(fd.px, fd.dx);
                    fd.interpolateY = d3.interpolate(fd.py, fd.dy);
                    break;
                }
            }
        });

        d3.transition()
            .duration(800)
            .each(function () {
                d3.transition(nodes_sel)
                    // .delay(function (d, i) {
                    //     return i * 50;
                    // })
                    .tween('x', function (d) {
                        return function (t) {
                            d.x = d.interpolateX(t);
                        };
                    })
                    .tween('y', function (d) {
                        return function (t) {
                            d.y = d.interpolateY(t);
                        };
                    });

            })
            .each('end', function () {
                force.stop();

                d3.transition(list_col_sel)
                    .style('opacity', 1);

                d3.transition(nodes_sel.data([]).exit())
                    .style('opacity', 0)
                    .remove();

                // transfer the node selection back to
                // its home where it can continue to be
                // used throughout the module.
                nodes_sel = temp_nodes_sel;
            });
        transition = false;
    }

    return network;
}
},{"./svg/buttonForce":13,"./svg/buttonList":14,"./svg/svgCross":15}],10:[function(require,module,exports){
var polyfills = require('../polyfills'),
    filters = require('../filters'),
    colors = require('../colors'),
    clone = require('../util/clone'),
    api = require('../util/backend')(),
    network = require('../network'),
    modal_flow = require('./modalFlow'),
    user = require('../user/user'),
    getTSV = require('../util/getTSV'),
    filterUI = require('../filterUI');

polyfills();

STEAMMap();

function STEAMMap() {
    var context = {};

    context.clone = clone;
    context.api = api;
    context.filters = filters;
    context.colors = colors;

    context.countries = getTSV(context.api.base +
                               '/static/geo/countries.tsv');

    context.network = network(context)
                        .display('list')
                        .renderSvg(false);

    context.filterUI = filterUI(context).filterable(false);
    context.modal_flow = modal_flow(context);
    context.user = user(context);

   function init () {

        context.user.check_auth();
    }

    init();
}
},{"../colors":1,"../filterUI":2,"../filters":3,"../network":9,"../polyfills":12,"../user/user":22,"../util/backend":24,"../util/clone":25,"../util/getTSV":27,"./modalFlow":11}],11:[function(require,module,exports){
var geoComponent =
        require('../formComponents/dropdownConditionalText'),

    radioComponent =
        require('../formComponents/radio'),

    socialAuthComponent =
        require('../formComponents/socialAuthSelection');

module.exports = ModalFlow;

function ModalFlow (context) {
    var self = {},
        state,              // current state
        previous_state,     // previous state
        input_data;         // object that tracks input data

    // form components
    var social_auth =
            socialAuthComponent(context)
                .node(d3.select('#add-yourself-login')),

        select_geo =
            geoComponent()
                .rootSelection(d3.select('#add-yourself-geo'))
                .validationVisual(false)
                .optionsKey(function (d) { return d.country; })
                .placeholder('zipcode')
                .initialValue(''),

        select_type =
            radioComponent()
                .node(d3.select('#select-type-component'))
                .groupName('steamie_type')
                .data([{
                    label: 'Individual',
                    value: 'individual',
                    selected: false
                }, {
                    label: 'Organization',
                    value: 'institution',
                    selected: false
                }]),

        select_work_in =
            radioComponent()
                .node(d3.select('#select-work-in-component'))
                .label({
                    label: 'I work in the following area',
                    type: 'p',
                    klass: ''
                })
                .groupName('steamie_work_in')
                .data([{
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
                }]);

    var action_to_about_sel =
        d3.select('#call-to-action div:first-child')
            .append('div')
            .attr('class', 'four-column-four action_to_about');

    action_to_about_sel
        .append('p')
        .text('STEM to STEAM');

    // elements that need to be turned on and off
    var el = self.el = {
        button: {

            action_to_about: {
                el: action_to_about_sel,
                onclick: function () {
                    self.state('about');
                },
                append_to_el: function () {}
            },

            about_to_action: {
                el: d3.select('#about_to_action'),
                on_click: function () {
                    self.state('call_to_action');
                },
                append_to_el: function () {}
            },

            add_me: {
                el: d3.select('#add-me-button'),
                on_click: function () {},
                append_to_el: function () {}
            },

            auth_me: {
                el: d3.select('#auth-me-button'),
                on_click: function () {},
                append_to_el: function (sel) {
                    sel.select('p').text('Next');
                }
            },

            go_to_profile: {
                el: d3.select('#go-to-profile'),
                on_click: function () {
                    self.state('profile_' + context.user.type());
                },
                append_to_el: function () {}
            },

            explore_locate_me: {
                el: d3.select('#explore-locate-me'),
                on_click: function () {
                        
                    var d = context.user.data(),
                        type  = context.user.type();

                    context.network
                        .highlight({
                            tlg_id: d.top_level.id,
                            steamie_type: type,
                            steamie_id: d[type].id
                        });
                },
                append_to_el: function () {}
            },

            cancel_add_button: {
                el: d3.select('#cancel-add-button'),
                on_click: function () {
                    self.state('logging_out');
                    context.api.logout(function (err, results) {
                        if (err) {
                            self.state('choose_type_add_zip');
                            return;
                        }
                        self.state('just_logged_out');
                    });
                },
                append_to_el: function () {}
            }
        },
        modal_header: {
            join: {
                el: d3.select('#modal-header-join')
            },
            thanks: {
                el: d3.select('#modal-header-thanks')
            },
            avatar: {
                el: d3.select('#modal-header-avatar')
            },
            logging_out: {
                el: d3.select('#modal-header-logging-out')
            },
            about: {
                el: d3.select('#modal-header-about')
            }
        },
        display: {
            modal: {
                el: d3.select('#modal')
            },
            call_to_action: {
                el: d3.select('#call-to-action')
            },
            choose_type_add_zip: {
                el: d3.select('#choose-type-add-zip')
            },
            thank_you: {
                el: d3.select('#thank-you')
            },
            profile_individual: {
                el: d3.select('#profile-individual')
            },
            profile_institution: {
                el: d3.select('#profile-institution')
            },
            about: {
                el: d3.select('#about')
            },
            modal_animation: {
                el: d3.select('#modal-animation')
            }
        }
    };

    var states = {
        logging_out: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'modal_header',
                el_name: 'logging_out'
            }];

            apply_state(active);
        },
        just_logged_out: function () {
            self.state('about');
        },
        about: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'about'
            }, {
                el_type: 'modal_header',
                el_name: 'about'
            }];

            apply_state(active);
        },
        call_to_action: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'call_to_action'
            }, {
                el_type: 'modal_header',
                el_name: 'join'
            }];

            apply_state(active);
        },
        choose_type_add_zip: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'choose_type_add_zip'
            }, {
                el_type: 'modal_header',
                el_name: 'join'
            }, {
                el_type: 'button',
                el_name: 'cancel_add_button'
            }];

            apply_state(active);
        },
        waiting_for_add_me_flow: function () {

            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'modal_animation'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
        },
        thank_you: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'thank_you'
            }, {
                el_type: 'modal_header',
                el_name: 'thanks'
            }];

            apply_state(active);
        },
        profile_individual: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'profile_individual'
            }, {
                el_type: 'modal_header',
                el_name: 'avatar'
            }];

            apply_state(active);
        },
        profile_institution: function () {
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'display',
                el_name: 'profile_institution'
            }, {
                el_type: 'modal_header',
                el_name: 'avatar'
            }];

            apply_state(active);
        }
    };

    self.init = function () {

        for (var key in el.button) {
            // setup buttons
            el.button[key]
                .el
                .on('click', el.button[key].on_click)
                .call(el.button[key].append_to_el);
        }

        social_auth.render();
        select_type.render();
        select_work_in.render();

        if (context.countries.data()) {
            // if the data is loaded already,
            // populate the select_geo module
            select_geo
                .options(context.countries.data())
                .render();
        } else {
            // wait until it is loaded, and then
            // render based on results
            context.countries.dispatch.on('loaded.modal', function () {
                select_geo
                    .options(context.countries.data())
                    .render();
            });
        }

        // how validation can propogate to this level
        social_auth
            .dispatch
            .on('valid.formElementCheck', function (d, i) {
                if (authIsValid()) {
                    enable_auth_me();
                }
            });

        select_geo
            .dispatch
            .on('valueChange.formElementCheck', function () {
                validate_add_me();
            });

        select_type
            .dispatch
            .on('valid.formElementCheck', function (d) {
                validate_add_me();
            });

        select_work_in
            .dispatch
            .on('valid.formElementCheck', function (d) {
                validate_add_me();
            })
            .on('valueChange.formElementCheck', function () {
                set_modal_color();
            });

        context.user
               .dispatch.on('checkAuthComplete', function(err, d) {

            d = context.user.data();
            console.log('auth check dispatch modal');
            console.log(d);

            if (context.user.authed()) {
                // authenticated

                self.add_avatar(d.avatar_url);

                if ((d.top_level) &&
                    ((d.individual) ||
                     (d.institution))) {

                    // should have given all info
                    // to be signed up and dont have
                    // to be sold on it

                    if (d.individual) {
                        context.user.type('individual');
                    }
                    else if (d.institution) {
                        context.user.type('institution');
                    }

                    context.user
                        .profile
                            .build();

                    el.button.go_to_profile.on_click();

                } else {

                    // have authenticated, but no
                    // data associated with them
                    self.state('choose_type_add_zip');
                }


            } else {
                // has not been authenticated
                // assume the user has never been
                // and ask them to sign up

                self.state('about');
            }

            // remove loading splash
            d3.select('#loading')
                .classed('active', false);
        });

        return self;
    };

    self.add_avatar = function (x) {

        d3.selectAll('.avatar')
            .attr('src', x);

        return self;
    };

    self.state = window.state = function (x) {
        if (!arguments.length) return state;

        if (x in states) {
            previous_state = state;
            state = x;
            states[state]();
        }

        return self;
    };

    function add_me_flow () {
        // set state
        self.state('waiting_for_add_me_flow');


        // for the User that is stored.
        context.user
            .type(select_type.selected())
            .setTypeDefaults()
            .work_in(select_work_in.selected())
            .top_level_input(select_geo.validatedData());

        console.log('context.user.data()');
        console.log(context.user.data());

        context.api.steamie_update(
            context.user.data(),
            function (err, results_raw) {
                if (err) {
                    console.log('error');
                    console.log(err);
                    return;
                }

                var results = JSON.parse(results_raw.responseText);

                console.log('add me flow');
                console.log(results);
                if (!results.top_level_input) {
                    console.log('error');
                    console.log(err);

                    // if there is an error, return
                    // the user to the stage where
                    // they left off, attempting to
                    // be added.
                    self.state('choose_type_add_zip');
                    return;
                }

                // update the user data based on
                // what came back from the server
                // also builds out an initial profile
                // for the user based on their new
                // data input
                context.user
                    .data(results)
                    // .setUpdateObject()
                    .profile
                        .build();

                // show thank you
                self.state('thank_you');
            });
    }

    function show_validation_errors(errors) {
        console.log('show validation errors');
    }

    function process_authentication (d) {
        window.location = d.url;
    }

    function apply_state (active) {
        // referencing the el obj of this module
        
        for (var type_key in el) {
            for (var name_key in el[type_key]) {
                if (active.length === 0) {
                    // set all hidden
                    el[type_key][name_key]
                        .el
                        .classed('active', false);
                } else {
                    var status_to_set = false;

                    for (var i = 0; i < active.length; i++) {
                        if ((active[i].el_type === type_key) &&
                            (active[i].el_name === name_key)) {

                            status_to_set = true;
                        }
                    }

                    el[type_key][name_key]
                            .el
                            .classed('active', status_to_set);
                }
            }
        }
    }

    // ensure validity of form elements
    function validate_add_me () {
        if (select_geo.isValid() &&
            select_type.isValid() &&
            select_work_in.isValid()) {
            
            enable_add_me();
            return true;
        } else {
            console.log('not');
            disable_add_me();
            return false;
        }
    }

    function authIsValid () {
        if (social_auth.isValid()) {
            return true;
        }
        return false;
    }

    // enable buttons to proceed through
    // the form process
    function enable_auth_me () {
        el.button.auth_me.el
            .classed('enabled', true)
            .on('click', function () {
                var p = el.button.auth_me.el.select('p');
                d3.transition()
                    .duration(300)
                    .each(function () {
                        d3.transition(p)
                            .style('opacity', 0)
                            .transition(p)
                            .text('Redirecting...')
                            .style('opacity', 1);
                    });
                process_authentication(social_auth.selected());
            });
    }

    function enable_add_me () {
        el.button.add_me.el
            .classed('enabled', true)
            .on('click', function () {
                add_me_flow();
            });
    }

    function disable_add_me () {
        el.button.add_me.el
            .classed('enabled', false)
            .on('click', null);
    }

    function set_modal_color () {
        select_work_in.data().forEach(function (d, i) {
            el.display
                .modal
                .el
                .classed(d.value, d.selected);
        });
    }

    return self;
}
},{"../formComponents/dropdownConditionalText":4,"../formComponents/radio":5,"../formComponents/socialAuthSelection":6}],12:[function(require,module,exports){
module.exports = function polyfills () {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    if (!Array.prototype.forEach)
    {
      Array.prototype.forEach = function(fun /*, thisArg */)
      {
        "use strict";

        if (this === void 0 || this === null)
          throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
          throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++)
        {
          if (i in t)
            fun.call(thisArg, t[i], i, t);
        }
      };
    }
};
},{}],13:[function(require,module,exports){
module.exports = '<svg version="1.1" ' +
    'id="Layer_2" ' +
    'xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'x="0px" y="0px" width="27px" height="27px" ' +
    'viewBox="0 0 27 27" enable-background="new 0 0 27 27" ' +
    'xml:space="preserve">' +
    '<rect x="1.5" y="1.5" fill="#FFFFFF" ' +
        'stroke="#D1D3D4" stroke-miterlimit="10" ' +
        'width="24" height="24"/>' +
    '<g>' +
	'<circle fill="#C8C8C8" cx="13.138" cy="7.31" r="2"/>' +
	'<circle fill="#C8C8C8" cx="13.138" cy="18.31" r="2"/>' +
	'<circle fill="#C8C8C8" cx="18.638" cy="12.81" r="2"/>' +
	'<circle fill="#C8C8C8" cx="7.638" cy="12.81" r="2"/>' +
'</g>' +
'</svg>';
},{}],14:[function(require,module,exports){
module.exports = '<svg version="1.1" ' +
    'id="Layer_2" ' +
    'xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'x="0px" y="0px" width="27px" height="27px" ' +
    'viewBox="0 0 27 27" enable-background="new 0 0 27 27" ' +
    'xml:space="preserve">' +
    '<rect x="1.5" y="1.5" fill="#FFFFFF" ' +
        'stroke="#D1D3D4" stroke-miterlimit="10" ' +
        'width="24" height="24"/>' +
    '<g>'+
		'<line fill="none" ' +
              'stroke="#C8C8C8" ' +
              'stroke-width="2" ' +
              'stroke-linecap="round" ' +
              'stroke-miterlimit="10" ' +
              'x1="7" y1="9" x2="19" y2="9"/> ' +

		'<line fill="none" ' +
              'stroke="#C8C8C8" ' +
              'stroke-width="2" ' +
              'stroke-linecap="round" ' +
              'stroke-miterlimit="10" ' +
              'x1="7" y1="14" x2="19" y2="14"/> ' +

		'<line fill="none" '+
              'stroke="#C8C8C8" ' +
              'stroke-width="2" ' +
              'stroke-linecap="round" ' +
              'stroke-miterlimit="10" ' +
              'x1="7" y1="19" x2="19" y2="19"/>' +
    '</g>' +
'</svg>';
},{}],15:[function(require,module,exports){
module.exports = function svgCross (sel) {
    var button_size = 45;

    // add the closing x as svg
    sel.append('svg')
        .attr('width', button_size)
        .attr('height', button_size)
        .selectAll('line')
        .data([
            { x1: 0, y1: 0,
              x2: button_size, y2: button_size },
            { x1: button_size, y1: 0,
              x2: 0, y2: button_size }
        ])
        .enter()
        .append('line')
            .attr('x1', function (d) {
                return d.x1;
            })
            .attr('y1', function (d) {
                return d.y1;
            })
            .attr('x2', function (d) {
                return d.x2;
            })
            .attr('y2', function (d) {
                return d.y2;
            })
            .attr('stroke-width', 1);

    sel.select('svg')
        .append('rect')
        .attr('class', 'blanket')
        .attr('height', button_size)
        .attr('width', button_size);
};
},{}],16:[function(require,module,exports){
module.exports = function addCheckmarks () {
    var size = 30,
        stroke = 'white',
        stroke_width = 1;

    function add (sel) {
        var svg = sel.append('svg')
            .attr('width', size)
            .attr('height', size)
            .attr('class', 'checkmark')
            .selectAll('line')
            .data([
                { x1: (size * 0.25), y1: (size * 0.75),
                  x2: size/2, y2: size },
                { x1: size/2, y1: size,
                  x2: size, y2: (size * 0.4) }
            ])
            .enter()
            .append('line')
                .attr('x1', function (d) {
                    return d.x1;
                })
                .attr('y1', function (d) {
                    return d.y1;
                })
                .attr('x2', function (d) {
                    return d.x2;
                })
                .attr('y2', function (d) {
                    return d.y2;
                })
                .attr('stroke-width', stroke_width)
                .attr('stroke', stroke);
    }

    add.stroke = function (x) {
        if (!arguments.length) return stroke;
        stroke = x;
        return add;
    };

    add.stroke_width = function (x) {
        if (!arguments.length) return stroke_width;
        stroke_width = x;
        return add;
    };

    add.size = function (x) {
        if (!arguments.length) return size;
        size = x;
        return add;
    };

    return add;
};
},{}],17:[function(require,module,exports){
var Individual = require('./profile_individual'),
    Institution = require('./profile_institution'),
    Settings = require('./profile_settings'),
    validatableManager =
        require('./validatableManager');

module.exports = function Profile (context) {
    var self = {},
        geo_options,
        profile,
        type,
        built = false,
        prev_valid,
        valid,
        save_button,
        validatable = validatableManager();

    self.built = function (x) {
        // tell the world whether or not
        // this jam has been built
        if (!arguments.length) return built;
        built = x;
        return self;
    };

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.remove = function () {
        self.built(false);
        reset_modal_color();
        profile.selection().html('');
    };

    self.build = function () {

        type = context.user.type();

        if ( type === 'individual') {
            profile = Individual(context)
                .selection(d3.select('#profile-individual'))
                .geoOptions(geo_options)
                .data(context.user.data());

        } else if (type === 'institution') {
            profile = Institution(context)
                .selection(d3.select('#profile-institution'))
                .geoOptions(geo_options)
                .data(context.user.data());

        } else {
            return self.built(false);
        }

        // set validator
        profile.validate = validate;
        profile.build();

        // common components that must
        // be valid to submit
        validatable.batchAdd([{
            isValid: profile.work_in.isValid,

        }, {
            isValid: profile.geo.isValid
        }, {
            isValid: profile.required_name.valid
        }]);

        set_modal_color();

        // add save button
        save_button = profile.selection()
            .append('div')
            .attr('class', 'four-column-one')
            .append('p')
            .attr('class', 'save-button')
            .text('Save');

        // add find me button
        var find_me = profile.selection()
            .append('div')
            .attr('class', 'four-column-two ' +
                           'find-me-button')
            .on('click', function () {
                context.modal_flow
                    .state('inactive_with_profile');
                    
                var d = context.user.data(),
                    type  = context.user.type();

                context.network
                    .highlight({
                        tlg_id: d.top_level.id,
                        steamie_type: type,
                        steamie_id: d[type].id
                    });
            });

        find_me
            .append('p')
            .attr('class', 'find-me')
            .text('Locate Me');

        // add a sign out button
        var sign_out = profile.selection()
                .append('div')
                .attr('class',
                      'logout-button four-column-one omega');
        sign_out
            .append('p')
            .attr('class', '')
            .text('Sign Out')
            .on('click', function () {
                context.modal_flow
                    .state('logging_out');
                context.api.logout(function (err, response) {
                    if (err) {
                        context.modal_flow
                            .state('profile_' +
                                   context.user.type());
                        return;
                    }

                    context.modal_flow
                        .state('just_logged_out');
                    self.remove();
                });
            });

       

        profile.work_in.dispatch
            .on('valueChange.profile', function () {
                set_modal_color();
            });

        // they start with the same value,
        // depend on futher validation
        // or changes to the dom to enable
        // the save button.
        prev_valid = valid = true;
        validate();

        self.built(true);

        return self;
    };

    function set_modal_color () {
        profile.work_in.data().forEach(function (d, i) {
            context.modal_flow
                .el
                .display
                .modal
                .el
                .classed(d.value, d.selected);
        });
    }

    function reset_modal_color () {
        profile.work_in.data().forEach(function (d, i) {
            context.modal_flow
                .el
                .display
                .modal
                .el
                .classed(d.value, false);
        });
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

    function validate () {
        // deal with validation
        if (validatable.areValid()) {
            valid = true;
        } else {
            valid = false;
        }

        // check to see if any of the
        // updatables, are updated.
        // they are not validatable,
        // just potentially, different.
        profile.updatable.check();

        // determine button functionality
        // based on validation and 
        // updatable object status
        if (profile.updatable.updated().length > 0) {
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

    function save_flow () {
        var data_to_submit =
            profile.decorate_for_submittal(update_user_data());

        save_button.text('Saving...');

        context
            .api
            .steamie_update(data_to_submit,
                             function (err, response) {
            if (err) {
                console.log('err');
                console.log(err);
                return;
            }
            
            console.log('do something with');
            console.log(response);

            var results = JSON.parse(response.responseText);

            console.log(results);
            // reset user data
            // useful since the top_level_geo value
            // might have been udpated, and that
            // should be reflected when the user asks
            // to locate themselves.
            context.user.data(results);
            profile.data(results);

            // reset the initial value of geo manually
            // since it gets validated server side
            profile.geo
                .initialValue(results.top_level_input)
                .updateDOM();

            // resets the initial values to the ones saved
            // to the server. in case the user continues to
            // do work while its being saved.
            profile.updatable.resetInitialValues();
            // will reset the save button, unless
            // they have continued to edit
            validate();
            save_button.text('Save');
        });
    }

    function update_user_data () {
        // something should be updated

        // updated data to be sent to
        // the server for saving
        var data_for_server = {},
            // copy of the data in profile.data,
            // to update and send propogate
            // out to the user object, also 
            // back down into the profile object.
            data = profile.data();

        profile.updatable.updated().forEach(function (n, i) {
            var cur_value = n.value();
            n.value_being_saved = cur_value;
            if (n.position_in_data.length === 1) {

                data[n.position_in_data[0]] =
                    cur_value;

                data_for_server[n.position_in_data[0]] =
                    cur_value;

            } else if (n.position_in_data.length === 2) {

                data[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    cur_value;

                // data for server may not have the correct
                // nested object to save against
                if (!data_for_server[n.position_in_data[0]]) {
                    data_for_server[n.position_in_data[0]] =
                        data[n.position_in_data[0]];
                }

                data_for_server[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    cur_value;
            }
        });

        return data_for_server;
    }

    return self;
};
},{"./profile_individual":18,"./profile_institution":19,"./profile_settings":20,"./validatableManager":23}],18:[function(require,module,exports){
var geoComponent =
        require('../formComponents/dropdownConditionalText'),
    radioComponent =
        require('../formComponents/radio'),
    textComponent =
        require('../formComponents/text'),
    textAreaComponent =
        require('../formComponents/textarea'),
    updatableManager =
        require('./updatableManager');

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
        
        first_name = self.required_name = textComponent()
            .selection(first_name_sel)
            .placeholder('first name')
            .initialValue(
                data.individual.first_name ?
                data.individual.first_name : '')
            .valid(function (val) {
                console.log('value');
                console.log(val);
                if (val.length > 0) {
                    return true;
                }
                return false;
            })
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
                label: 'I work in:',
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
                label: 'Why STEAM matters to you:',
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
},{"../formComponents/dropdownConditionalText":4,"../formComponents/radio":5,"../formComponents/text":7,"../formComponents/textarea":8,"./updatableManager":21}],19:[function(require,module,exports){
var geoComponent =
        require('../formComponents/dropdownConditionalText'),
    radioComponent =
        require('../formComponents/radio'),
    textComponent =
        require('../formComponents/text'),
    textAreaComponent =
        require('../formComponents/textarea'),
    updatableManager =
        require('./updatableManager');

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
        
        name = self.required_name = textComponent()
            .selection(name_sel)
            .placeholder('name of organization')
            .initialValue(
                data.institution.name ?
                data.institution.name : '')
            .valid(function (val) {
                if (val.length > 0) {
                    return true;
                }
                return false;
            })
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
            .attr('class', 'four-column-two sel-work-in')
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
                label: 'My organization works in:',
                type: 'p',
                klass: ''
            })
            .groupName('institution-work-in-group')
            .data(work_in_options)
            .initialSelected(work_in_initial)
            .render();

        var description_sel = sel
            .append('div')
            .attr('class', 'four-column-two omega steamie-description')
            .attr('id', 'institution-description');

        description = textAreaComponent()
            .selection(description_sel)
            .label({
                label: 'Why STEAM matters to your organization:',
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
},{"../formComponents/dropdownConditionalText":4,"../formComponents/radio":5,"../formComponents/text":7,"../formComponents/textarea":8,"./updatableManager":21}],20:[function(require,module,exports){
module.exports = function ProfileSettings () {
    var self = {},
        selection;

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    return self;
};
},{}],21:[function(require,module,exports){
module.exports = function UpdatableComponentManager () {
    var self = {},
        updatable = [],
        updated = [];

    self.add = function (x) {
        // add objects that include links to functions
        // and arrays that describe the component,
        // and its relationship to the data structu
        // it comes from
        // {
        //     isDifferent: function
        //     value: function
        //     position_in_data: []
        //     reset_initial: function
        // }
        updatable.push(x);
        return self;
    };

    self.batchAdd = function (x) {
        x.forEach(function (n, i) {
            updatable.push(n);
        });
        return self;
    };

    self.all = function () {
        return updatable;
    };

    self.check = function () {
        updated = [];
        updatable.forEach(function (n, i) {
            if (n.isDifferent()) {
                updated.push(n);
            }
        });
        return self;
    };

    self.updated = function () {
        return updated;
    };

    self.resetInitialValues = function () {
        updated.forEach(function (n, i) {
            n.reset_initial(n.value_being_saved);
        });
    };

    return self;
};
},{}],22:[function(require,module,exports){
var profile = require('./profile');

module.exports = User;

function User (context) {
    var user = {},
        authed,   // true/false
        data,     // obj response from server
        dispatch = user.dispatch = d3.dispatch('checkAuthComplete');

    // --------
    // steam specific variables
    var steamie_type;

    user.check_auth = function () {
        // checks the server to see if user
        // is authenticated
        // depending on response, sets state
        // of the form.

        var url = context.api.steamie;

        d3.json(url, function (err, data_response) {
            console.log('auth check');
            console.log(data_response);
            if ((err) ||
                (typeof(data_response) === 'undefined') ||
                (data_response.meta.total_count === 0)) {
                // not auth'ed
                console.log('Not authed.');
                data = null;
                authed = false;
            } else {
                user.data(data_response);
                authed = true;
            }

            dispatch.checkAuthComplete.apply(this, arguments);
        });

        return user;
    };

    user.authed = function (x) {
        if (!arguments.length) return authed;
        authed = x;
        return user;
    };

    // status is the response from the server
    // about the user's authentication
    user.data = function (x) {
        if (!arguments.length) return data;
        if ('objects' in x) {
            data = x.objects[0];
        } else {
            data = x;
        }

        if (data.individual) {
            steamie_type = 'individual';
        } else if (data.institution) {
            steamie_type = 'institution';
        }

        return user;
    };

    user.setTypeDefaults = function () {
        if (steamie_type === 'individual') {

            // defaults for an individual
            user.individual({
                first_name: null,
                last_name: null,
                email: null,
                url: null,
                institution: null,
                title: null,
                email_subscription: false
            });
        }
        else if (steamie_type === 'institution') {

            // defaults for an institution
            user.institution({
                name: null,
                url: null,
                representative_first_name: null,
                representative_last_name: null,
                representative_email: null
            });
        }

        return user;
    };

    // --------
    // steam specific functions

    user.profile = profile(context);

    if (context.countries.data()) {
        // if the data is loaded already,
        // populate the user profile
        user.profile
            .geoOptions(context.countries.data());
    } else {
        // wait until it is loaded, and then
        // render based on results
        context.countries.dispatch.on('loaded', function () {
            user.profile
                .geoOptions(context.countries.data());
        });
    }

    user.zip_code = function (x) {
        if (!arguments.length) return data.zip_code;
        data.zip_code = x;
        return user;
    };

    user.avatar_url = function () {
        return data.avatar_url;
    };

    user.type = function (x) {
        if (!arguments.length) return steamie_type;
        steamie_type = x;
        return user;
    };

    // steamie_geo will go to the server and be
    // saved as part of the user's profile
    // top_level_input = steamie_geo
    user.top_level_input = function (x) {
        if (!arguments.length) return data.top_level_input;
        data.top_level_input = x;
        return user;
    };

    user.work_in = function (x) {
        if (!arguments.length) return data.work_in;
        data.work_in = x;
        return user;
    };

    user.individual = function (x) {
        if (!arguments.length) return data.individual;
        data.individual = x;
        return user;
    };

    user.institution = function (x) {
        if (!arguments.length) return data.institution;
        data.institution = x;
        return user;
    };

    return user;
}
},{"./profile":17}],23:[function(require,module,exports){
module.exports = function ValidatableComponentManager () {
    var self = {},
        validatable = [],
        validated = [];

    self.add = function (x) {
        // add objects that include links to functions
        // and arrays that describe the component,
        // and its relationship to the data structu
        // it comes from
        // {
        //     isValid: function
        // }
        validatable.push(x);
        return self;
    };

    self.batchAdd = function (x) {
        x.forEach(function (n, i) {
            validatable.push(n);
        });
        return self;
    };

    self.all = function () {
        return validatable;
    };

    self.check = function () {
        validated = [];
        validatable.forEach(function (n, i) {
            if (n.isValid()) {
                console.log('n');
                console.log(n);
                validated.push(n);
            }
        });
        return self;
    };

    self.validated = function () {
        return validated;
    };

    self.areValid = function () {
        self.check();
        if (self.validated().length === self.all().length) {
            return true;
        }
        return false;
    };

    return self;
};
},{}],24:[function(require,module,exports){
var config = require('./config')(location.hostname);

module.exports = Backend;

function Backend () {

    var api = {};

    api.base = config.backend_url;

    api.api_url = config.backend_url + '/api/' + config.version;

    api.steamie = api.api_url + '/steamie/?format=json';
    api.geo = api.api_url + '/geo/?format=json';
    api.network = api.api_url + '/network/?format=json';

    api.steamie_user = function (x) {
        return api.api_url + '/steamie/' + x + '/?format=json';
    };

    api.network_url = function (x) {
        return api.api_url + '/network/' + x + '/?format=json';
    };

    api.logout = function (callback) {
        d3.json(api.base + '/map/logout/', callback);
    };

    api.network_request = function (network_id, callback) {
        console.log('network request');
        console.log('url: ', api.network_url(network_id));
        var request = d3.json(api.network_url(network_id), callback);
        return request;
    };

    api.steamie_update = function (data_to_submit, callback) {
        var csrf_token = get_cookie('csrftoken');

        console.log('data');
        console.log(data_to_submit);
        console.log('url');
        console.log(api.steamie_user(data_to_submit.id));

        // submit this data against the steamie endpoint
        var xhr = d3.xhr(api.steamie_user(data_to_submit.id))
            .mimeType('application/json')
            .header('X-CSRFToken', csrf_token)
            .header('Content-type', 'application/json')
            .send('PATCH',
                  JSON.stringify(data_to_submit),
                  callback);
    };

    function get_cookie (c_name) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start, c_end));
        }
        return c_value;
    }

    return api;
}
},{"./config":26}],25:[function(require,module,exports){
var clone = function clone (obj) {
    // Thanks to stackoverflow:
    // http://stackoverflow.com/questions/
    // 728360/most-elegant-way-to-clone-a-javascript-object

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = clone(obj[attr]);
            }
        }
        return copy;
    }
};

if (typeof module !== 'undefined') {
    exports = module.exports = clone;
} else {
    window.clone = clone;
}
},{}],26:[function(require,module,exports){
module.exports = Config;

function Config (hostname) {
    var local = (hostname === 'localhost');

    return {
        backend_url: local ?
            'http://localhost:5000' :
            'http://stemtosteam.herokuapp.com',

        version: 'v1'
    };
}
},{}],27:[function(require,module,exports){
module.exports = function dataTSV (url) {
    var self = {},
        data;

    self.dispatch = d3.dispatch('loaded');

    self.data = function (x) {
        if (!arguments.length) return data;
        data = x;
        return self;
    };

    function get () {
        d3.tsv(url, function (err, response) {
            self.data(response);
            self.dispatch.loaded.apply(this, arguments);
        });
    }

    // initialize
    get();

    return self;
};
},{}]},{},[10])