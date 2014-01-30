;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = Arcs;

// Manage the arcs that wrap clusters
// to show proportion of population
function Arcs (context) {

    var arcs = {},
        arc = d3.svg.arc(),
        τ = 2 * Math.PI,
        arc_scale = d3.scale.linear()
            .range([0, τ]),
        format = d3.format(',');

    arcs.create = function () {
        // bound to the zoom of the map
        // sets the arcs per marker cluster

        // adding arcs
        d3.selectAll('.arc-wrapper')
            .html('')
            .each(function () {
                var node = d3.select(this);

                // icon display, set in the createIconFactory
                // method in the cluster creation process.
                var meta = {
                    total: +node.attr('data-total'),
                    total_active:
                        +node.attr('data-total-active'),
                    prev_total_active:
                        +node.attr('data-prev-total-active'),
                    icon_category:
                        node.attr('data-icon-cateogry')
                };

                // the data that will be bound to the svg
                // in order to draw the arcs.
                var data = [
                    {
                        'value': 'research',
                        'count': +node.attr('data-research')
                    }, {
                        'value': 'political',
                        'count': +node.attr('data-political')
                    }, {
                        'value': 'education',
                        'count': +node.attr('data-education')
                    }, {
                        'value': 'industry',
                        'count': +node.attr('data-industry')
                    }
                ];

                // add the prev_status, and status
                // attributes to the data object
                // for appropriate scaling based on
                // the filter settings
                add_status(data);

                // update the domain to set the
                // arc start and end angles
                arc_scale.domain([0, meta.total]);

                // add arc specific data to the
                // data to be bound and drawn.
                var accounted_for = 0;
                data.forEach(function (d, i) {
                    d.startAngle = accounted_for;

                    var slice = arc_scale(d.count);
                    accounted_for += slice;
                    
                    d.endAngle = accounted_for;

                    d.innerRadius = context.icon_size
                                        [meta.icon_category]
                                        [d.prev_status]
                                        .innerRadius;
                    d.outerRadius = context.icon_size
                                        [meta.icon_category]
                                        [d.prev_status]
                                        .outerRadius;
                });

                var svg_dimensions =
                    context.icon_size[meta.icon_category].total;

                var svg = node.append('svg')
                    .attr('class', 'arc-svg')
                    .attr('width', svg_dimensions)
                    .attr('height', svg_dimensions)
                    .append('g')
                    .attr('transform',
                          'translate(' +
                          svg_dimensions / 2 + ',' +
                          svg_dimensions / 2 + ')');

                
                var arc_sel = svg.selectAll('.arc-segment')
                    .data(data)
                    .enter()
                    .append('path')
                    .attr('class', 'arc-segment')
                    .style('fill', function (d) {
                        return context.colors[d.value];
                    })
                    .attr('d', arc);

                
                var span_sel = d3.select(node.node().parentNode)
                                .select('span')
                                .datum({
                                    start: meta.prev_total_active,
                                    end: meta.total_active
                                });

                span_sel.transition()
                    .duration(800)
                    .tween('text', function (d) {
                        var i = d3.interpolateRound(d.start, d.end);
                        return function (t) {
                            this.textContent = format(i(t));
                        };
                    });

                arc_sel.transition()
                    .duration(800)
                    .attrTween('d', tweenArc(function (d, i) {
                        return {
                            innerRadius: context.icon_size
                                           [meta.icon_category]
                                           [d.status]
                                           .innerRadius,
                            outerRadius: context.icon_size
                                           [meta.icon_category]
                                           [d.status]
                                           .outerRadius
                        };
                    }));

            });
    };

    function tweenArc(b) {
        return function(a, i) {
            var d = b.call(this, a, i),
                i = d3.interpolate(a, d);
            for (var k in d) {
                // update data
                a[k] = d[k];
            }
            return function(t) {
                return arc(i(t));
            };
        };
    }

    function add_status (node_data) {
        // answers the question, what size
        // does this need to be?
        // @param d: data obj to create arcs
        // 
        // possible values
        // 'unselected'
        // 'default'
        // 'selected'
        // 
        // value is found in the filters
        // array, alongside each object.
        // 'status' and 'status_size'

        for (var j = node_data.length - 1; j >= 0; j--) {

            // check for all being active
            var active_count = 0;
            for (var i = context.filters.length - 1; i >= 0; i--) {

                var cur_active = false;
                if(context.filters[i].active) {
                    active_count += 1;
                    cur_active = true;
                }
                if(context.filters[i].value ===
                   node_data[j].value) {

                    if (cur_active) {
                        node_data[j].status = 'selected';
                    } else {
                        node_data[j].status = 'unselected';
                    }
                }
            }

            // check for all being active
            var prev_active_count = 0;
            for (var i = context.prev_filters.length - 1;
                 i >= 0;
                 i--) {

                var cur_active = false;
                if(context.prev_filters[i].active) {
                    prev_active_count += 1;
                    cur_active = true;
                }
                if(context.prev_filters[i].value ===
                   node_data[j].value) {

                    if (cur_active) {
                        node_data[j].prev_status = 'selected';
                    } else {
                        node_data[j].prev_status = 'unselected';
                    }
                }
            }

            if (active_count === 4) {
                node_data[j].status = 'default';
            }
            if (prev_active_count === 4) {
                node_data[j].prev_status = 'default';
            }

        }

        // return node_data;
    }

    return arcs;
}
},{}],2:[function(require,module,exports){
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
        d3.json(api.network_url(network_id), callback);
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
},{"./config":6}],3:[function(require,module,exports){
module.exports = ClusterIconSize;

// Defines cluster sizes, for both
// selected and unselsected states
function ClusterIconSize () {
    var size = {
        inner_diameter: {
            two_digit: 36,
            three_digit: 42,
            four_digit: 50,
            five_digit: 54,
            six_digit: 61
        },
        // gap between inner icon and arc
        // based on arc.status
        gap_width: {
            unselected: 4,
            default: 2,
            selected: 1
        },
        // width of the arc
        arc_width: {
            unselected: 1,
            default: 4,
            selected: 10
        }
    };

    (function set_size (size) {
        for (var key in size.inner_diameter) {
            size[key] = {
                total: size.inner_diameter[key] +
                       ((size.gap_width.selected +
                         size.arc_width.selected) * 2),
                unselected: {
                    innerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.unselected)),
                    outerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.unselected) +
                                  (size.arc_width.unselected))
                },
                default: {
                    innerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.default)),
                    outerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.default) +
                                  (size.arc_width.default))
                },
                selected: {
                    innerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.selected)),
                    outerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.selected) +
                                  (size.arc_width.selected))
                }
            };
        }
    })(size);

    return size;
}
},{}],4:[function(require,module,exports){
module.exports = Clusters;

function Clusters (context) {

    var clusters = {},
        geojson,    // L.geojson of data
        data,       // raw data
        max;        // max of data

    var format = d3.format(',');

    // clustering settings
    var clusters_group = L.markerClusterGroup({
        // gives single markers the same
        // symbology as the clusters
        singleMarkerMode: true,

        // does not pass any padding,
        // so writing a seperate clusterclick
        // function to replicate this, but with
        // padding, so user isnt lost in the
        // middle of two points when they click.
        zoomToBoundsOnClick: false,

        // function used to create cluster symbology
        // defines classes for differentiating scale
        // and whether a cluster is representing
        // a single entity (country or district)
        // or more than one.
        iconCreateFunction: function (cluster) {

            var steamie_count = {
                research: 0,
                political: 0,
                education: 0,
                industry: 0,
                total: 0,
                total_active: 0,
                prev_total_active: 0
            };
            var children = cluster.getAllChildMarkers(),
                child_count = cluster.getChildCount();

            for (var i = 0; i < children.length; i++) {
                steamie_count =
                    calculate_steamies(
                        children[i].feature,
                        steamie_count);
            }


            // start class list
            var c = ' mc-',
                icon_category;

            // set the scale of the cluster
            if (steamie_count.total < 100) {

                c += '2-digit';
                icon_category = 'two_digit';
            }

            else if (steamie_count.total < 1000) {

                c += '3-digit';
                icon_category = 'three_digit';
            }

            else if (steamie_count.total < 10000) {

                c += '4-digit';
                icon_category = 'four_digit';
            }

            else if (steamie_count.total < 100000) {

                c += '5-digit';
                icon_category = 'five_digit';
            }

            else {

                c += '6-digit';
                icon_category = 'six_digit';
            }

            if (child_count === 1) {
                c += ' represents-one-entity';
            } else {
                c += ' represents-multiple-entities';
            }

            return new L.DivIcon({
                html: '<div class="span-wrapper">' +
                    '<span>' +
                    format(steamie_count.prev_total_active) +
                    '</span>' +
                    '</div>' +
                    '<div class="arc-wrapper"' +
                        ' data-research=' + steamie_count.research +
                        ' data-political=' + steamie_count.political +
                        ' data-education=' + steamie_count.education +
                        ' data-industry=' + steamie_count.industry +
                        ' data-total=' + steamie_count.total +
                        ' data-total-active=' +
                        steamie_count.total_active +
                        ' data-prev-total-active=' +
                        steamie_count.prev_total_active +
                        ' data-icon-cateogry="' +
                        icon_category + '"' +
                        '></div>',
                className: 'marker-cluster' + c,
                iconSize: new L.Point(
                             context.icon_size[icon_category].total,
                             context.icon_size[icon_category].total)
            });
        },

        // for the polygon that shows the area
        // of entities captured
        polygonOptions: {
            opacity: 0.6,
            weight: 0,
            className: 'cluster-polygon'
        },

        //A cluster will cover at most 
        // this many pixels from its center
        maxClusterRadius: 80
    });

    // on click of individual clusters
    clusters_group.on('click', function (event) {
        // click cluster
        context.network.init(event.layer.feature.properties);
    });

    clusters_group.on('clusterclick', function (d) {
        var bounds = d.layer.getBounds().pad(0.5);

        context.map.fitBounds(bounds);

        // remove all svg references.
    });

    clusters.bindArcs = function () {
        clusters_group.on('animationend', function () {
            context.arcs.create();
        });

        return clusters;
    };

    clusters.data = function (x) {
        // initialize data on the map

        if (!arguments.length) return data;

        data = x;
        add_to_map();

        return clusters;
    };

    clusters.filter = function () {

        // clear clusters
        clusters.clear();
        // add clusters
        add_to_map();

        return clusters;
    };

    clusters.clear = function () {
        // remove cluster layers
        clusters_group.clearLayers();

        context.map.removeLayer(clusters_group);

        return clusters;
    };

    clusters.init = function () {
        // show initial map data
        // d3.json('/static/geo/fake_level_1_pnt.geojson',
        d3.json('/static/geo/fake_top_level_geo.geojson',
                clusters.data);

        return clusters;
    };

    function add_to_map () {

        geojson = L.geoJson(data);

        clusters_group.addLayer(geojson);

        context.map.addLayer(clusters_group);
        context.arcs.create();
    }

    function calculate_steamies (d, count) {
        // d - is the current cluster's data
        // count - is the cumulative count of cluster data
        // count.res, count.pol, count.total, ect
        for (var i = 0; i < context.filters.length; i++) {
            if (context.filters[i].active) {
                count.total_active +=
                    d.properties[context.filters[i].value];
            }
            count.total +=
                d.properties[context.filters[i].value];
            count[context.filters[i].value] +=
                d.properties[context.filters[i].value];

            // also set prev_filters
            // context.filters.length === context.prev_filters.length
            if (context.prev_filters[i].active) {
                count.prev_total_active +=
                    d.properties[context.prev_filters[i].value];
            }
        }

        return count;
    }

    return clusters;
}
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
module.exports = filterUI;

// UI for manipulating data
function filterUI (context) {

    var ui = {},
        active_count = 4,
        prev_active_count,
        clicked = 0;

    var filter_bar = d3.select('.filter_bar');

    ui.filter_bar = filter_bar;

    ui.init = function () {
        filter_bar.classed('all-active', true);

        var filter_buttons = filter_bar.selectAll('.button')
            .data(context.filters)
            .enter()
            .append('div')
            .attr('class', function (d) {
                return 'button active ' + d.value;
            })
            .text(function (d) {
                return d.display;
            })
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
    };

    return ui;
}
},{}],8:[function(require,module,exports){
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
        display: 'political',
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
},{}],9:[function(require,module,exports){
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
        initial_value;

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
        var initial_text_selection_data,
            initial_edtiable_text,
            initial_value_select;

        if (options[options.length-1].country === '') {
            options.pop();
        }
        options.forEach(function (d, i) {
            if (d.country === 'United States of America') {
                return;
            }
            // to make this reusable, you would
            // want to be able to set this function
            // dynamically.
            if (initial_value === d.country) {

                initial_text_selection_data = [{
                    active: false
                }];

                initial_edtiable_text = '';

                initial_value_select = d.country;
            }
        });

        // initial value is not in the options
        // field, so the value does not need to change
        if (!initial_text_selection_data) {
            
            initial_text_selection_data = [{
                active: true
            }];

            initial_edtiable_text = initial_value;

            initial_value_select = 'United States of America';
        }
        // end set the initial values for rendering

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
                .data(initial_text_selection_data)
                .enter()
                .append('div')
                .attr('class', function (d) {
                    var active = d.active ? ' active' : '';
                    return 'input-text hide-til-active' + active;
                });


        editable_text = textComponent()
                            .selection(text_selection)
                            .placeholder(placeholder)
                            .initialValue(initial_edtiable_text)
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
        select.property('value', initial_value_select);

        // set state based on render
        validate();

        return self;
    };

    function validate () {
        if ((editable_text.isNotEmpty() &&
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

    return self;
};
},{"../ui/checkmark":25,"./text":14}],10:[function(require,module,exports){
module.exports = function flowAnimation () {
    var self = {},
        selection,
        force,
        data,
        canvas_sel,
        nodes_sel,
        initial = 10,
        node_count,
        rendered = false;

    self.selection = function (x) {
        if(!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.addHighlight = function (x, y) {
        add_highlight(x, y);
        return self;
    };

    self.remove = function () {
        if (rendered) {
            force.stop();
            force = undefined;
            canvas_sel.remove();
        }
        return self;
    };

    self.render = function () {
        if (rendered) {
            force.alpha(10);
            return;
        }
        console.log('rendering');
        console.log(selection);
        var random = d3.random.normal(0, 15);

        var height = window.innerHeight,
            width = window.innerWidth;

        data = d3.range(initial).map(function (i) {
            var d = {
                id: i,
                x: random() + (width/2),
                y: random() + (height/2),
                r: 8,
                highlight: false
            };
            d.dx = d.x;
            d.dy = d.y;

            console.log(d.x, d.y);

            return d;
        });

        console.log(data);

        force = d3.layout.force()
            .gravity(0.1)
            .friction(0.9)
            .charge(-30)
            .size([width, height])
            .links([])
            .nodes(data)
            .on('tick', tick);

        canvas_sel = selection
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .append('g');

        nodes_sel = canvas_sel.selectAll('.movement');

        start();
        rendered = true;
    };

    function add_highlight (x, y) {
        var prev_highlight;
        if ((data.length - 1) >= (initial)) {
            prev_highlight = data.pop();
        }

        data.push({
            id: (prev_highlight ? prev_highlight.id : data.length),
            x: x,
            y: y,
            dx: x,
            dy: y,
            r: 10,
            highlight: true
        });
        start();
    }

    function start() {
        nodes_sel = nodes_sel
            .data(force.nodes(), function (d) { return d.id; });

        nodes_sel
            .enter()
            .append('circle')
            .attr('class', function (d) {
                return 'movement ' + (d.highlight ? 'highlight' : '');
            })
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', function (d) { return d.r; });

        nodes_sel
            .exit()
            .transition()
            .duration(800)
            .attr('r', 0)
            .remove();

        force.start();
    }

    function tick () {
        nodes_sel.attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; });
    }

    return self;
};
},{}],11:[function(require,module,exports){
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

        console.log('render radio');
        console.log(initial_selected);
        console.log(selected);

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
},{}],12:[function(require,module,exports){
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
},{"../ui/checkmark":25}],13:[function(require,module,exports){
module.exports = function svgCross (sel) {
    console.log('cross');
    console.log(sel);
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
};
},{}],14:[function(require,module,exports){
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
        initial_value;

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
        return input_selection.property('value');
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

    return self;
};
},{}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
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
            updatable.push(x);
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
            n.reset_initial(n.value());
        });
    };

    return self;
};
},{}],17:[function(require,module,exports){
var filters = require('./filters'),
    colors = require('./colors'),
    clone = require('./util/clone'),
    icon_size = require('./clusterIconSize')(),

    api = require('./backend')(),

    filterUI = require('./filterUI'),
    network = require('./network'),
    clusters = require('./clusters'),
    arcs = require('./arcs'),
    map = require('./map'),
    getTSV = require('./util/getTSV'),

    modal_flow = require('./modalFlow'),
    user = require('./user');

STEAMMap();

function STEAMMap() {
    var context = {};

    // util
    context.clone = clone;

    // data
    context.api = api;
    context.prev_filters = clone(filters);
    context.filters = filters;
    context.colors = colors;
    context.icon_size = icon_size;

    context.countries = getTSV(context.api.base +
                               '/static/geo/countries_geocodable.tsv');

    // ui
    context.network = network(context);
    context.clusters = clusters(context);
    context.arcs = arcs(context);
    context.filterUI = filterUI(context);
    context.map = map(context);
    context.modal_flow = modal_flow(context);
    context.user = user(context);

    function init () {
        context.clusters
            .bindArcs()
            .init();
        context.filterUI.init();
        context.modal_flow.init();

        // modal_flow dispatches on
        // check auth being completed
        // and sets the modal form flow
        // to the position it should be in
        context.user.check_auth();
    }

    init();
}
},{"./arcs":1,"./backend":2,"./clusterIconSize":3,"./clusters":4,"./colors":5,"./filterUI":7,"./filters":8,"./map":18,"./modalFlow":19,"./network":20,"./user":26,"./util/clone":27,"./util/getTSV":28}],18:[function(require,module,exports){
module.exports = Map;

// returns leaflet map object
function Map (context) {

    var zoomstart = function () {
        // so that the zoom does make things re-filter
        context.prev_filters = context.clone(context.filters);
    };

    var zoomend = function() {
        // console.log('zoomlevel: ', map.getZoom());
    };

    // var mabox_id = "",
    var mabox_id = "mgdevelopers.map-6m0pmhd7",
        map = L.mapbox
            .map('steam-map', mabox_id, {
                'maxZoom': 12
            })
            .setView([39.16, -95.0], 4)
            .on('zoomstart', zoomstart)
            .on('zoomend', zoomend);

    // define max bounds
    // disables users ability to continually pan
    // east/west beyond the extent of where the data
    // actually resides
    var max_south_west = new L.LatLng(-90, -240),
        max_north_east = new L.LatLng(90, 240),
        max_bounds = new L.LatLngBounds(
            max_south_west,
            max_north_east);

    map.setMaxBounds(max_bounds);

    return map;
}
},{}],19:[function(require,module,exports){
var geoComponent =
        require('./formComponents/dropdownConditionalText'),

    radioComponent =
        require('./formComponents/radio'),

    socialAuthComponent =
        require('./formComponents/socialAuthSelection'),

    modalAnimation =
        require('./formComponents/modalAnimation'),

    svg_cross =
        require('./formComponents/svgCross');

module.exports = ModalFlow;

function ModalFlow (context) {
    var self = {},
        state,              // current state
        previous_state,     // previous state
        input_data;         // object that tracks input data

    self.dispatch = d3.dispatch('ApplyStateWaitingForAddMeFlow',
                                'ApplyStateProfile',
                                'ApplyStateChooseTypeAddZip');

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
                    label: 'Institution',
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
                    label: 'Political',
                    value: 'political',
                    selected: false
                }, {
                    label: 'Industry',
                    value: 'industry',
                    selected: false
                }]),

        modal_animation = modalAnimation();

    // elements that need to be turned on and off
    var el = self.el = {
        button: {
            close_modal: {
                el: d3.select('#close-modal'),
                on_click: function () {
                    if (context.user.profile.built()) {
                        self.state('inactive_with_profile');
                    } else {
                        self.state('inactive_no_profile');
                    }
                },
                append_to_el: svg_cross,
            },
            open_modal: {
                el: d3.select('#activate-add-yourself'),
                on_click: function () {
                    if (previous_state === 'inactive_no_profile') {
                        // first time through
                        self.state('call_to_action');
                    } else {
                        self.state(previous_state);
                    }
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
                append_to_el: function () {}
            },

            go_to_profile: {
                el: d3.select('#go-to-profile'),
                on_click: function () {
                    self.state('profile_' + context.user.type());
                },
                append_to_el: function () {}
            },

            profile_link: {
                el: d3.select('.profile-link'),
                on_click: function () {
                    self.state('profile_' + context.user.type());
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
            }
        }
    };

    var states = {
        just_logged_out: function () {
            previous_state = 'inactive_no_profile';
            self.state('inactive_no_profile');
        },
        inactive_no_profile: function () {
            var active = [{
                el_type: 'button',
                el_name: 'open_modal'
            }];
            apply_state(active);
        },
        inactive_with_profile: function () {
            var active = [{
                el_type: 'button',
                el_name: 'profile_link'
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
            }, {
                el_type: 'button',
                el_name: 'close_modal'
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
                el_name: 'close_modal'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
            self.dispatch.ApplyStateChooseTypeAddZip();
        },
        waiting_for_add_me_flow: function () {
            console.log('setting waiting_for_add_me_flow');
            var active = [{
                el_type: 'display',
                el_name: 'modal'
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];
            console.log(active);

            apply_state(active);
            self.dispatch.ApplyStateWaitingForAddMeFlow();
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
            }, {
                el_type: 'button',
                el_name: 'close_modal'
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
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
            self.dispatch.ApplyStateProfile();
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
            }, {
                el_type: 'button',
                el_name: 'close_modal'
            }];

            apply_state(active);
            self.dispatch.ApplyStateProfile();
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
        modal_animation
            .selection(d3.select('#modal-animation'));

        self.dispatch
            .on('ApplyStateWaitingForAddMeFlow.modalNetwork',
                function () {
                    modal_animation.render();
                });

        self.dispatch
            .on('ApplyStateProfile', function () {
                modal_animation.remove();
            });

        self.dispatch
            .on('ApplyStateChooseTypeAddZip', function () {
                // if you get kicked back to this state,
                // you shouldn't have the animation
                modal_animation.remove();
            });

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


            // remove loading icon
            d3.select('#activate-add-yourself .add-me')
                .classed('active', true);
            d3.select('#activate-add-yourself .loading')
                .classed('active', false);

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
                    self.state('inactive_with_profile');

                    if (d.individual) {
                        context.user.type('individual');
                    }
                    else if (d.institution) {
                        context.user.type('institution');
                    }

                    context.user
                        .profile
                            .build();

                } else {

                    // have authenticated, but no
                    // data associated with them
                    self.state('choose_type_add_zip');
                }


            } else {
                // has not been authenticated
                // assume the user has never been
                // and ask them to sign up
                self.state('call_to_action');

                // self.state('waiting_for_add_me_flow');
            }
        });

        return self;
    };

    self.add_avatar = function (x) {

        d3.selectAll('.avatar')
            .attr('src', x);

        return self;
    };

    self.state = function (x) {
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
                var results = JSON.parse(results_raw.responseText);

                console.log('add me flow');
                console.log(results);
                if (err) {
                    console.log('error');
                    console.log(err);

                    // if there is an error, return
                    // the user to the stage where
                    // they left off, attempting to
                    // be added.
                    self.state('choose_type_add_zip');
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
},{"./formComponents/dropdownConditionalText":9,"./formComponents/modalAnimation":10,"./formComponents/radio":11,"./formComponents/socialAuthSelection":12,"./formComponents/svgCross":13}],20:[function(require,module,exports){
var svg_cross = require('./formComponents/svgCross');

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
        // name of the overlay
        title,
        title_wrapper_sel;

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
            default: 1,
            unselected: 0.666666667,
            selected: 1.333333333
        },
        opacity = {
            default: 1,
            unselected: 0.5,
            selected: 1
        };

    network.filter = function () {
        try {
            // only include/exclude if there is
            // an instance of nodes having been
            // selected

            var active_count = 0;
            for (var i = context.filters.length - 1; i >= 0; i--) {
                if (context.filters[i].active) {
                    active_count += 1;
                }
            }

            if (active_count === 4) {
                // reset all to default
                nodes_sel.each(function (d) {
                    d.status = 'default';
                });

            } else {

                nodes_sel
                    .each(function (d) {
                        if (active(d)) {
                            d.status = 'selected';
                        } else {
                            d.status = 'unselected';
                        }
                    });
            }

            nodes_sel
                .transition()
                .duration(1000)
                .style('opacity', set_opacity)
                .attr('transform', transform);

        } catch (e) {
            console.log(
                'Can not filter the non-existent network.');
        }

        return network;
    };

    network.nodes = function (x) {
        if(!arguments.length) return nodes;

        // give an initial position
        x.forEach(function (d) {
            d.x = width/2 + random_around_zero(30);
            d.y = height/2 + random_around_zero(30);
            d.dx = width/2 + random_around_zero(30);
            d.dy = height/2 + random_around_zero(30);

            // also setup type
            if (d.indiviual) {
                d.type = 'indiviual';
            } else {
                d.type = 'institution';
            }
        });

        nodes = x;

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

        // set gravity of force based on the
        // number of nodes
        if (nodes.length > 500 &
            nodes.length <= 800) {

            gravity = 0.2;
        }
        else if (nodes.length > 800 &
            nodes.length <= 1100) {

            gravity = 0.3;
        }
        else if (nodes.length > 800 &
            nodes.length <= 1100) {

            gravity = 0.4;
        }
        else if (nodes.length > 1100 &
            nodes.length <= 2000) {

            gravity = 0.5;
        } else if (nodes.length > 2000) {
            // greater than 2000
            gravity = 0.6;
        }

        height = window.innerHeight;
        width = window.innerWidth;

        canvas = canvas_wrapper
                    .classed('active', true)
                    .append('svg')
                    .attr('class', 'canvas')
                    .attr('width', width)
                    .attr('height', height);

        // add a close button
        canvas_wrapper
            .selectAll('.close-button')
            .data([{ f: network.remove }])
            .enter()
            .append('div')
            .attr('class', 'close-button')
            .on('click', function (d) {
                d.f();
            })
            .call(svg_cross);

        title_wrapper_sel = canvas_wrapper
            .append('div')
                .attr('class', 'header-wrapper');

        title_wrapper_sel
            .append('div')
                .attr('class', 'grid full-width clearfix')
            .append('div')
                .attr('class', 'four-column clearfix offset-one')
            .append('h3')
                .html(title);

        force = d3.layout.force()
            .friction(friction)
            .charge(charge)
            .gravity(gravity)
            .size([width, height])
            .links([])
            .nodes(nodes)
            .start();

        nodes_sel = canvas.selectAll('.node')
                .data(nodes)
            .enter()
            .append('g')
                .attr('class', function (d) {
                    return 'node ' +
                            d.work_in + ' ' +
                            d.type;
                })
                .each(function (d, i) {
                    if (active(d)) {
                        d.status = 'selected';
                    } else {
                        d.status = 'unselected';
                    }
                })
                .style('opacity', set_opacity)
                .attr('transform', transform)
                .call(force.drag)
                .on('click', function (d) {
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

                    // clear user data
                    if (info_tip_sel) {
                        remove_info_tip();
                    }

                    var mouse_position =
                        d3.mouse(canvas_wrapper.node());

                    var infotip_position = new Array(2);

                    if (mouse_position[1] < (window.innerHeight/2)) {
                        infotip_position[1] = {
                            offset_from: 'top',
                            offset_distance: mouse_position[1] + 20,
                            offset_reset: 'bottom',
                            offset_reset_value: 'auto'
                        };
                    } else {
                        infotip_position[1] = {
                            offset_from: 'bottom',
                            offset_distance: window.innerHeight -
                                             mouse_position[1],
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
                            .style('left', mouse_position[0] + 'px')
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
                })
                .call(add_symbols);

        force.on('tick', function () {
            nodes_sel
                .attr('transform', transform);
        });

        return network;
    };

    network.remove = function () {
        // remove svg
        canvas.remove();

        // deactivate wrapper
        canvas_wrapper.classed('active', false);

        // remove all nodes from the graph
        nodes_sel.data([])
            .exit()
            .remove();

        force.stop();
        force = undefined;

        // these wont be set until after
        // a network has been initialized
        // and a node has been clicked
        if (info_tip_sel) {
            remove_info_tip();
        }
        if (canvas_blanket_sel) {
            canvas_blanket_sel.remove();
        }

        title_wrapper_sel.remove();

        return network;
    };

    network.init = function (data) {
        // used to initialize a network graph
        // data is passed in from the cluster
        // group that is clicked.

        context.api
            .network_request(data.tlg_id, function (err, results) {
                console.log('returned data');
                console.log(results);
                network
                      .nodes(results.steamies)
                      .title((results.us_bool ?
                              {
                                us_bool: results.us_bool,
                                us_state: results.us_state,
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

        d3.select(this).remove();
        remove_info_tip();
    }

    function remove_info_tip () {
        info_tip_sel.data([])
            .exit()
            .remove();
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
            .attr('src', function (d) {
                // return d.avatar;
                return "https://pbs.twimg.com" +
                    "/profile_images/2216753469/ruben_face_normal.png";
            });

        var inner_div = sel.append('div')
                           .attr('class', 'user_info');

        inner_div.append('p')
            .attr('class', 'name')
            .text(function (d) {
                return (d.first_name || '') + ' ' +
                       (d.last_name || '');
            });

        inner_div.append('p')
            .attr('class', 'description')
            .text(function (d) {
                return d.description || 'This is a tweets length'+
                    ' description about why I am interested in STEAM';
            });
    }

    return network;
}
},{"./formComponents/svgCross":13}],21:[function(require,module,exports){
var Individual = require('./profile_individual'),
    Institution = require('./profile_institution'),
    Settings = require('./profile_settings');

module.exports = function Profile (context) {
    var self = {},
        geo_options,
        profile,
        type,
        built = false;

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

    self.build = function () {
        type = context.user.type();

        if ( type === 'individual') {
            profile = Individual(context)
                .selection(d3.select('#profile-individual'))
                .geoOptions(geo_options)
                .data(context.user.data())
                .build();

        } else if (type === 'institution') {
            profile = Institution(context)
                .selection(d3.select('#profile-institution'))
                .geoOptions(geo_options)
                .data(context.user.data())
                .build();
        } else {
            return self.built(false);
        }

        set_modal_color();

        profile.selection()
                .append('div')
                .attr('class', 'four-column-four')
                .append('p')
                .attr('class', 'large button')
                .text('Sign out.')
                .on('click', function () {

                    context.api.logout(function (err, response) {
                        if (err) {
                            // how do you tell a user that the
                            // logout wasnt complete?
                            console.log('could not log out');
                            console.log(err);
                            return;
                        }

                        console.log('logged out, now what?');
                        console.log(response);

                        context.modal_flow
                            .state('just_logged_out');
                    });
                });

        profile.work_in.dispatch
            .on('valueChange.profile', function () {
                set_modal_color();
            });

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

    return self;
};
},{"./profile_individual":22,"./profile_institution":23,"./profile_settings":24}],22:[function(require,module,exports){
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
        data,
        prev_valid,
        valid;

    var first_name,
        last_name,
        email,
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

        geo = geoComponent()
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
            .attr('class', 'four-column-four sel-work-in')
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
            .attr('class', 'four-column-four steamie-description')
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

        save_button =
            sel.append('div')
                .attr('class', 'four-column-four')
                .append('p')
                .attr('class', 'large button')
                .text('Save');

        // turn on dispatch validation
        geo.dispatch
            .on('valueChange.profileIndividual', function () {
                validate();
            });

        work_in.dispatch
            .on('valid.profileIndividual', function () {
                validate();
            });

        first_name.dispatch
            .on('valueChange.profileIndividual', function () {
                validate();
            });

        last_name.dispatch
            .on('valueChange.profileIndividual', function () {
                validate();
            });

        description.dispatch
            .on('valueChange.profileIndividual', function () {
                validate();
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
        x.id = data.id;
        x.resource_uri = data.resource_uri;
        if (x.individual) {
            x.individual.id = data.individual.id;
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

                data[n.position_in_data[0]] =
                    n.value();

                data_for_server[n.position_in_data[0]] =
                    n.value();

            } else if (n.position_in_data.length === 2) {

                data[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    n.value();

                // data for server may not have the correct
                // nested object to save against
                if (!data_for_server[n.position_in_data[0]]) {
                    data_for_server[n.position_in_data[0]] =
                        data[n.position_in_data[0]];
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
},{"./formComponents/dropdownConditionalText":9,"./formComponents/radio":11,"./formComponents/text":14,"./formComponents/textarea":15,"./formComponents/updatableManager":16}],23:[function(require,module,exports){
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

        geo = geoComponent()
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

        save_button =
            sel.append('div')
                .attr('class', 'four-column-four')
                .append('p')
                .attr('class', 'large button')
                .text('Save');

        // turn on dispatch validation
        geo.dispatch
            .on('valueChange.profileInstitution', function () {
                validate();
            });

        work_in.dispatch
            .on('valid.profileInstitution', function () {
                validate();
            });

        name.dispatch
            .on('valueChange.profileInstitution', function () {
                validate();
            });

        representative_first_name.dispatch
            .on('valueChange.profileInstitution', function () {
                validate();
            });

        representative_last_name.dispatch
            .on('valueChange.profileInstitution', function () {
                validate();
            });

        representative_email.dispatch
            .on('valueChange.profileInstitution', function () {
                validate();
            });

        description.dispatch
            .on('valueChange.profileInstitution', function () {
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

    function decorate_for_submittal (x) {
        x.id = data.id;
        x.resource_uri = data.resource_uri;
        if (x.institution) {
            x.institution.id = data.institution.id;
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

                data[n.position_in_data[0]] =
                    n.value();

                data_for_server[n.position_in_data[0]] =
                    n.value();

            } else if (n.position_in_data.length === 2) {

                data[n.position_in_data[0]]
                               [n.position_in_data[1]] =
                    n.value();

                // data for server may not have the correct
                // nested object to save against
                if (!data_for_server[n.position_in_data[0]]) {
                    data_for_server[n.position_in_data[0]] =
                        data[n.position_in_data[0]];
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
},{"./formComponents/dropdownConditionalText":9,"./formComponents/radio":11,"./formComponents/text":14,"./formComponents/textarea":15,"./formComponents/updatableManager":16}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{"./profile":21}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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
},{}]},{},[17])
;