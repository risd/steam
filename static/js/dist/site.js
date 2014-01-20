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
                        'abbr': 'res',
                        'count': +node.attr('data-res')
                    }, {
                        'abbr': 'pol',
                        'count': +node.attr('data-pol')
                    }, {
                        'abbr': 'edu',
                        'count': +node.attr('data-edu')
                    }, {
                        'abbr': 'ind',
                        'count': +node.attr('data-ind')
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
                        return context.colors[d.abbr];
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
                if(context.filters[i].abbr === node_data[j].abbr) {
                    if (cur_active) {
                        node_data[j].status = 'selected';
                    } else {
                        node_data[j].status = 'unselected';
                    }
                }
            }

            // check for all being active
            var prev_active_count = 0;
            for (var i = context.prev_filters.length - 1; i >= 0; i--) {
                var cur_active = false;
                if(context.prev_filters[i].active) {
                    prev_active_count += 1;
                    cur_active = true;
                }
                if(context.prev_filters[i].abbr === node_data[j].abbr) {
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

    var api = config.backend_url + '/api/' + config.version;

    return {
        base: config.backend_url,
        steamie: api + '/steamie/?format=json',
        geo: api + '/geo/?format=json',
        network: api + '/network/?format=json'
    };
}
},{"./config":7}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
                res: 0,
                pol: 0,
                edu: 0,
                ind: 0,
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
                html: '<div>' +
                    '<span>' +
                    format(steamie_count.prev_total_active) +
                    '</span>' +
                    '</div>' +
                    '<div class="arc-wrapper"' +
                         ' data-res=' + steamie_count.res +
                         ' data-pol=' + steamie_count.pol +
                         ' data-edu=' + steamie_count.edu +
                         ' data-ind=' + steamie_count.ind +
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
            color: 'red',
            fillColor: 'red'
        },

        //A cluster will cover at most 
        // this many pixels from its center
        maxClusterRadius: 80
    });

    // on click of individual clusters
    clusters_group.on('click', function (item) {
        // click cluster

        context.network.init(item.layer.feature.properties);
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
        d3.json('/static/geo/fake_level_1_pnt.geojson',
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
                    d.properties[context.filters[i].abbr];
            }
            count.total +=
                d.properties[context.filters[i].abbr];
            count[context.filters[i].abbr] +=
                d.properties[context.filters[i].abbr];

            // also set prev_filters
            // context.filters.length === context.prev_filters.length
            if (context.prev_filters[i].active) {
                count.prev_total_active +=
                    d.properties[context.prev_filters[i].abbr];
            }
        }

        return count;
    }

    return clusters;
}
},{}],6:[function(require,module,exports){
var colors = {
    res: 'rgb(105,230,64)',
    pol: 'rgb(255,97,127)',
    edu: 'rgb(255,137,49)',
    ind: 'rgb(39,180,242)'
};

if (typeof module !== 'undefined') {
    exports = module.exports = colors;
} else {
    window.colors = colors;
}
},{}],7:[function(require,module,exports){
module.exports = Config;

function Config (hostname) {
    var local = (hostname === 'localhost');

    return {
        backend_url: local ?
            'http://localhost:5000' :
            'http://django-steam.herokuapp.com',

        version: 'v1'
    };
}
},{}],8:[function(require,module,exports){
// gives an element simple placeholder
// functionality that is enjoyed by
// input elements.

// pass in a d3 selected dom node with a placeholder attr,
// or pass one in
// ensures contenteditable is true
// if on focus, placeholder = value, remove
// the contents
// if on unfocus, there is no value, replace
// the placeholder
module.exports = Editable;

function Editable () {
    var self = {},
        placeholder = '',
        focused = false,
        prev_valid = false,
        valid = false,
        editable_placeholder = '00000',
        initial_value,
        selection,
        editable, // selection for editable div
        label; // d.type, d.label

    self.dispatch = d3.dispatch('validChange');

    self.placeholder = function (x) {
        if (!arguments.length) return placeholder;
        placeholder = x;
        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
        return self;
    };

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.value = function (x) {
        if (!arguments.length) return editable.html();

        // if editable is defined, change the value
        if (editable) {
            editable.html(value);
        } else {
            initial_value = x;
        }

        return self;
    };

    self.isValid = function () {
        return valid;
    };

    self.render = function () {
        selection
            .append(label.type)
            .text(label.label);

        editable = selection
            .append('div')
            .attr('contenteditable', 'true')
            .attr('class', 'large editable')
            .attr('id', 'add-yourself-zip')
            .attr('placeholder', editable_placeholder)
            .html(
                initial_value ?
                initial_value :
                editable_placeholder);

        console.log('editable');
        console.log(editable);
        
        editable
            .on('focus.editable-internal', function () {
                editable.classed('focused', true);
                if (editable.html() === editable_placeholder) {
                    editable.html('');
                }
                focused = true;
            })
            .on('blur.editable-internal', function () {
                editable.classed('focused', false);

                var cur_html = editable.html();

                // firefox will put a break tag in
                // your input when empty.
                if ((cur_html === '') ||
                    (cur_html.indexOf('<br>') > -1)) {
                    editable.html(placeholder);
                    editable.classed('value-set', false);
                } else {
                    editable.classed('value-set', true);
                }
                focused = false;
            })
            .on('keydown.editable-internal', function () {
                // do not allow 'enter' (keycode 13)
                // do not allow more than 8 characters.
                //   if more than 8, only allow
                //   backspace (keycode 8)
                if ((d3.event.keyCode === 13) ||
                    ((d3.select(this).text().length >= 8) &&
                     (d3.event.keyCode !== 8))) {
                    d3.event.preventDefault();
                }
            })
            .on('keyup.editable-internal', function () {
                console.log('keyup');
                validate();

                editable.classed('valid', valid);

                if (valid !== prev_valid) {
                    self.dispatch
                        .validChange.apply(this, arguments);
                }

                prev_valid = valid;
            });

        return self;
    };

    function validate () {
        if ((editable.html() === placeholder) ||
            (editable.html() === '')) {
            valid = false;
        } else {
            valid = true;
        }

        return valid;
    }

    
    return self;
}
},{}],9:[function(require,module,exports){
module.exports = {
    network: function (args) {
        // pass in geojson properties, return
        // fake data for the network graph

        var network_data = {
            country: args.uid,
            steamies: []
        };

        var fake_data = function (work_in) {
            // return fake network data
            // only data that is passed in
            // is the segement the point
            // represents ()
            // 4/5 will be individuals

            var current;
            
            if (Math.random() < 0.8) {
                // i, individuals
                current = {
                    first_name: Faker.Name.firstName(),
                    last_name: Faker.Name.lastName(),
                    email: Faker.Internet.email(),
                    url: 'name@domain.com',
                    title: 'Engineer',
                    engaged_as: '',
                    work_in: work_in,
                    description: '',
                    type: 'i'
                };
            } else {
                // g, institutions/groups
                current = {
                    name: Faker.Company.companyName(),
                    representative_first_name:
                        Faker.Name.firstName(),
                    representative_last_name:
                        Faker.Name.lastName(),
                    representative_email:
                        Faker.Internet.email(),
                    url: 'name@domain.com',
                    engaged_as: '',
                    work_in: work_in,
                    description: '',
                    type: 'g'
                };
            }

            return current;
        };

        for (var i = 0; i < args.edu; i++) {
            network_data.steamies.push(fake_data('edu'));
        }
        for (var i = 0; i < args.res; i++) {
            network_data.steamies.push(fake_data('res'));
        }
        for (var i = 0; i < args.pol; i++) {
            network_data.steamies.push(fake_data('pol'));
        }
        for (var i = 0; i < args.ind; i++) {
            network_data.steamies.push(fake_data('ind'));
        }

        return network_data;
    }
};
},{}],10:[function(require,module,exports){
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
                return 'button active ' + d.abbr;
            })
            .text(function (d) {
                return d.display;
            })
            .on('click', function (d) {

                prev_active_count = active_count;
                // context.arcs.prevFilters(context.clone(context.filters));
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
                        if (context.filters[i].abbr === d.abbr) {
                            context.filters[i].active = 1;
                            active_count += 1;
                        } else {
                            context.filters[i].active = 0;
                            filter_bar
                                .select('.button.' +
                                        context.filters[i].abbr)
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

                            if (context.filters[i].abbr === d.abbr) {
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
},{}],11:[function(require,module,exports){
var filters = [{
        abbr: 'res',
        display: 'research',
        active: 1
    }, {
        abbr: 'edu',
        display: 'education',
        active: 1
    }, {
        abbr: 'pol',
        display: 'political',
        active: 1
    }, {
        abbr: 'ind',
        display: 'industry',
        active: 1
    }];

if (typeof module !== 'undefined') {
    exports = module.exports = filters;
} else {
    window.filters = filters;
}
},{}],12:[function(require,module,exports){
var Editable = require('../editable'),
    Checkmark = require('../ui/checkmark');

module.exports = function dropdownConditionalText () {
    var self = {},
        prev_valid = false,
        valid = false,
        root_selection,
        text_selection,
        editable_text,
        checkmark_sel,
        options,
        options_key,
        select_wrapper,
        select,
        select_options,
        placeholder,
        initial_value;

    self.dispatch = d3.dispatch('validChange');

    self.isValid = function () {
        return valid;
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
        root_selection
            .call(Checkmark());
        checkmark_sel = root_selection.select('.checkmark');

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


        editable_text = Editable()
                            .selection(text_selection)
                            .placeholder(placeholder)
                            .value(initial_edtiable_text)
                            .label({
                                type: 'p',
                                label: 'enter your zipcode'
                            })
                            .render();

        editable_text
            .dispatch
            .on('validChange', function () {
                validate();
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
        if ((editable_text.isValid() &&
             text_selection.classed('active')) ||
            (text_selection.classed('active') === false)) {

            valid = true;
        } else {
            valid = false;
        }

        checkmark_sel.classed('valid', valid);

        if (valid !== prev_valid) {
            self.dispatch
                .validChange.apply(this, arguments);
        }

        prev_valid = valid;

        return valid;
    }

    return self;
};
},{"../editable":8,"../ui/checkmark":21}],13:[function(require,module,exports){
module.exports = function radioSelection (context) {
    var self = {},
        valid = false,
        selected = false,
        // parent node where options will be appended
        node,
        group_name,
        label,
        data = [];

    self.dispatch = d3.dispatch('valid');

    self.render = function () {
        // must call node(x) to
        // define a node before
        // calling .render()

        if (label) {
            node.append(label.type)
                .text(label.label)
                .attr('class', label.klass);
        }

        var sel = node
            .selectAll('.type-option')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'type-option')
            .on('mouseup', function (d) {
                d3.event.stopPropagation();
                data.forEach(function (n, i) {
                    n.selected = false;
                });
                d.selected = true;
                selected = d;
                valid = true;
                self.dispatch.valid.apply(this, arguments);
            })
            .call(addInput);

        return self;
    };

    self.label = function (x) {
        if (!arguments.length) return label;
        label = x;
        return self;
    }

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

    self.selected = function () {
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

        sel.append('label')
            .attr('class', 'type-option-label')
            .attr('for', function (d, i) {
                return 'type-option-' + d.value;
            })
            .text(function (d, i) {
                return d.label;
            });
    }

    return self;
};
},{}],14:[function(require,module,exports){
var Checkmark = require('../ui/checkmark');

module.exports = function socialAuthSelection (context) {
    var social = {},
        valid = false,
        selected = false,
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

    social.selected = function () {
        return selected;
    };

    return social;
};
},{"../ui/checkmark":21}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){
var filters = require('./filters'),
    colors = require('./colors'),
    clone = require('./clone'),
    icon_size = require('./clusterIconSize')(),

    api = require('./backend')(),

    filterUI = require('./filterUI'),
    network = require('./network'),
    clusters = require('./clusters'),
    arcs = require('./arcs'),
    map = require('./map'),
    getTSV = require('./getTSV'),

    modal_flow = require('./modalFlow'),
    user = require('./user'),

    fake = require('./fakeDataGenerator');

STEAMMap();

function STEAMMap() {
    var context = {};

    // util
    context.clone = clone;
    context.fake = fake;

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
},{"./arcs":1,"./backend":2,"./clone":3,"./clusterIconSize":4,"./clusters":5,"./colors":6,"./fakeDataGenerator":9,"./filterUI":10,"./filters":11,"./getTSV":15,"./map":17,"./modalFlow":18,"./network":19,"./user":22}],17:[function(require,module,exports){
module.exports = Map;

// returns leaflet map object
function Map (context) {

    var zoomstart = function () {
        // so that the zoom does make things re-filter
        context.prev_filters = context.clone(context.filters);
    };

    var zoomend = function() {

    };

    var mabox_id = "",
    // var mabox_id = "mgdevelopers.map-6m0pmhd7",
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
},{}],18:[function(require,module,exports){
var validator = require('./validators'),

    geoComponent =
        require('./formComponents/dropdownConditionalText'),

    radioComponent =
        require('./formComponents/radio'),

    socialAuthComponent =
        require('./formComponents/socialAuthSelection');

module.exports = ModalFlow;

function ModalFlow (context) {
    var form = {},
        state,              // current state
        previous_state,     // previous state
        input_data,         // object that tracks input data
        child_window,       // ref to the popup window object
        child_status;       // set interval function to check

    // form components
    var social_auth =
            socialAuthComponent(context)
                .node(d3.select('#add-yourself-login')),

        select_geo =
            geoComponent()
                .rootSelection(d3.select('#add-yourself-geo'))
                .optionsKey(function (d) { return d.country; })
                .placeholder('00000')
                .initialValue(null),

        select_type =
            radioComponent()
                .node(d3.select('#select-type-component'))
                .groupName('steamie_type')
                .data([{
                    label: 'Individual',
                    value: 'i',
                    selected: false
                }, {
                    label: 'Institution',
                    value: 'g',
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
                }]),

        profile_link_selection = d3.select('.profile-link');

    var ui = {
        popup_window_properties: function () {
            var cur_window = {};
            if (window.screenX) {
                cur_window.x = window.screenX;
                cur_window.y = window.screenY;
            } else {
                cur_window.x = window.screenLeft;
                cur_window.y = window.screenTop;
            }

            if (document.documentElement.clientHeight) {
                cur_window.height = document
                                    .documentElement
                                    .clientHeight;
                cur_window.width = document
                                    .documentElement
                                    .clientWidth;
            } else {
                cur_window.height = window.innerHeight;
                cur_window.width = window.innerWidth;
            }

            cur_window.x += 50;
            cur_window.y += 50;
            cur_window.height -= 100;
            cur_window.width -= 100;

            return cur_window;
        }
    };

    // elements that need to be turned on and off
    var el = {
        button: {
            close_modal: {
                el: d3.select('#close-modal'),
                on_click: function () {
                    form.state('inactive_no_profile');
                },
                append_to_el: function (sel) {
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
                            .attr('stroke-width', 1)
                            .attr('stroke', 'white');
                }
            },

            back: {
                el: d3.select('#back-modal-add-yourself'),
                on_click: function () {
                    form.state(previous_state);
                },
                append_to_el: function () {}
            },

            open_modal: {
                el: d3.select('#activate-add-yourself'),
                on_click: function () {
                    if (previous_state === 'inactive_no_profile') {
                        // first time through
                        form.state('call_to_action');
                    } else {
                        form.state(previous_state);
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
                    form.state('profile_' + context.user.type());
                },
                append_to_el: function () {}
            },

            profile_link: {
                el: profile_link_selection,
                on_click: function () {
                    form.state('profile_' + context.user.type());
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
        inactive_no_profile: function () {
            var active = [{
                el_type: 'button',
                el_name: 'open_modal'
            }];
            apply_state(active);
        },
        inactive_with_profile: function () {
            var active = [];
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
        }
    };

    form.init = function () {

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
            .on('validChange.formElementCheck', function () {
                if (zipAndTypeValid()) {
                    enable_add_me();
                } else {
                    disable_add_me();
                }
            });

        select_type
            .dispatch
            .on('valid.formElementCheck', function (d) {
                if (zipAndTypeValid()) {
                    enable_add_me();
                }
            });

        select_work_in
            .dispatch
            .on('valid.formElementCheck', function (d) {
                if (zipAndTypeValid()) {
                    enable_add_me();
                }
            });

        context.user
               .dispatch.on('checkAuthComplete', function(err, d) {
            d = context.user.data();
            console.log('auth check dispatch modal');
            console.log(d);

            if (context.user.authed()) {
                // authenticated

                form.add_avatar(d.objects[0].avatar_url);

                if ((d.objects[0].top_level) &&
                    ((d.objects[0].individual) ||
                     (d.objects[0].institution))) {

                    // should have given all info
                    // to be signed up and dont have
                    // to be sold on it
                    form.state('inactive_with_profile');
                    context.user
                        .profile
                            .build();

                } else {

                    // have authenticated, but no
                    // data associated with them
                    form.state('choose_type_add_zip');
                }


            } else {
                // has not been authenticated
                // assume the user has never been
                // and ask them to sign up
                form.state('call_to_action');
            }
        });

        return form;
    };

    form.add_avatar = function (x) {

        d3.selectAll('.avatar')
            .attr('src', x);

        return form;
    };

    form.state = function (x) {
        if (!arguments.length) return state;

        if (x in states) {
            previous_state = state;
            state = x;
            states[state]();
        }

        return form;
    };

    function add_me_flow () {
        // for the User that is stored.
        context.user
            .type(select_type.selected().label)
            .work_in(select_work_in.selected().label)
            .top_level_input(select_geo.validatedData());

        steamie_request(
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
                    form.state('choose_type_add_zip');
                }

                // update the user data based on
                // what came back from the server
                // also builds out an initial profile
                // for the user based on their new
                // data input
                context.user
                    .data(results)
                    .profile
                        .build();

                // show thank you
                form.state('thank_you');
            });
    }

    function steamie_request(data_to_submit, callback) {
        console.log('complete submit');
        // submit data

        var csrf_token = get_cookie('csrftoken');
        console.log(csrf_token);

        console.log('url');
        console.log(context.api.steamie);
        // api.steamie
        // 'http://0.0.0.0:5000/api/v1/steamie/'
        var xhr = d3.xhr(context.api.steamie)
            .mimeType('application/json')
            .header('X-CSRFToken', csrf_token)
            .header('Content-type', 'application/json')
            .send('PUT',
                  JSON.stringify(data_to_submit),
                  callback);
    }

    function show_validation_errors(errors) {
        console.log('show validation errors');
    }

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

    function check_child () {
        if (child_window.closed) {
            // stop checking for the child window status
            clearInterval(child_status);

            // check to see if auth occured
            context.user.check_auth();
        } else {
            // console.log('child open');
        }
    }

    function process_authentication (d) {

        var popup = ui.popup_window_properties(),

            window_features =
                'width=' + popup.width + ',' +
                'height=' + popup.height + ',' +
                'left=' + popup.x + ',' +
                'top=' + popup.y;

        child_window =
            window.open(d.url, '',  window_features);

        child_status = setInterval(check_child, 1000);
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
    function zipAndTypeValid () {
        if (select_geo.isValid() &&
            select_type.isValid() &&
            select_work_in.isValid()) {
            return true;
        }
        return false;
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

    return form;
}
},{"./formComponents/dropdownConditionalText":12,"./formComponents/radio":13,"./formComponents/socialAuthSelection":14,"./validators":23}],19:[function(require,module,exports){
module.exports = Network;

// Network graph
function Network (context) {

    var network = {},
        height = window.innerHeight,
        width = window.innerWidth,
        canvas_wrapper = d3.select('#steamie-network'),
        canvas,
        nodes,
        force,
        node_sel,
        info_tip_sel,
        canvas_blanket_sel;

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
        });

        nodes = x;

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

        canvas = canvas_wrapper
                    .classed('active', true)
                    .append('svg')
                    .attr('class', 'canvas')
                    .attr('width', width)
                    .attr('height', height);

        // add a close button
        canvas_wrapper
            .selectAll('.button')
            .data([{ t: 'x', f: network.destroy }])
            .enter()
            .append('div')
            .attr('class', 'button')
            .text(function (d) {
                return d.t;
            })
            .on('click', function (d) {
                d.f();
            });

        force = d3.layout.force()
            .friction(friction)
            .charge(charge)
            .gravity(gravity)
            .size([window.innerWidth, window.innerHeight])
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
                            .style(infotip_position[1].offset_from,
                                   infotip_position[1].offset_distance +
                                   'px')
                            .style(infotip_position[1].offset_reset,
                                   infotip_position[1].offset_reset_value)
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

    network.destroy = function () {
        // remove svg
        canvas.remove();

        // deactivate wrapper
        canvas_wrapper.classed('active', false);

        // remove all nodes from the graph
        nodes_sel.data([])
            .exit()
            .remove();

        remove_info_tip();

        canvas_blanket_sel.remove();

        return network;
    };

    network.init = function (data) {
        // used to initialize a network graph
        // data is passed in from the cluster
        // group that is clicked.

        // var data_url =
            // mapped.data.backend + '/api/' + uid + '/';
        // d3.json(data_url, function (err, network_data) {
        //     mapped.network
        //           .nodes(network_data)
        //           .create();
        // });
        var network_data = context.fake.network(data);

        network
              .nodes(network_data.steamies)
              .create();
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
            return d.type === 'g';
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
            if (context.filters[i].abbr === d.work_in) {

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
                return d.first_name + ' ' + d.last_name;
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
},{}],20:[function(require,module,exports){
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
},{"./formComponents/dropdownConditionalText":12,"./formComponents/radio":13}],21:[function(require,module,exports){
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
            if ((err) |
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
        data = x;

        // steamie_type is otherwise set by
        // the modal form, so it should be
        // set and realiable when data is
        // coming in, too.
        if (data.objects[0].individual) {
            user.type('individual');
        } else if (data.objects[0].institution) {
            user.type('institution');
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
        if (!arguments.length) return data.objects[0].zip_code;
        data.objects[0].zip_code = x;
        return user;
    };

    user.avatar_url = function () {
        return data.objects[0].avatar_url;
    };

    // sugar over the individual and institution
    // attributes of a user. defines a default
    // object for institution or individual, if
    // one is defined
    // assumes that if user.type is being used to set
    // a user's type, then it doesn't have any data
    // for that yet.
    user.type = function (x) {
        if (!arguments.length) {
            if (user.individual()) {
                return 'individual';
            } else if (user.institution()) {
                return 'institution';
            } else {
                return null;
            }
        }
        if ((x.toLowerCase() === 'individual') ||
            (x === 'i')) {

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
        else if ((x.toLowerCase() === 'institution') ||
                 (x === 'g')) {

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

    // steamie_geo will go to the server and be
    // saved as part of the user's profile
    // top_level_input = steamie_geo
    user.top_level_input = function (x) {
        if (!arguments.length) return data.objects[0].top_level_input;
        data.objects[0].top_level_input = x;
        return user;
    };

    user.work_in = function (x) {
        if (!arguments.length) return data.objects[0].work_in;
        data.objects[0].work_in = x;
        return user;
    };

    user.individual = function (x) {
        if (!arguments.length) return data.objects[0].individual;
        data.objects[0].individual = x;
        return user;
    };

    user.institution = function (x) {
        if (!arguments.length) return data.objects[0].institution;
        data.objects[0].institution = x;
        return user;
    };

    return user;
}
},{"./profile":20}],23:[function(require,module,exports){
module.exports = Validators;

function Validators () {
    var validators = {};

    var regex = {
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    };
    

    validators.individual = LGTM.validator()
        .validates('first_name')
            .using(function (value, attr, object) {
                if (object.individual.first_name) {
                    return true;
                }
                return false;
            }, 'You must enter a first name')
        .validates('last_name')
            .using(function (value, attr, object) {
                if (object.individual.last_name) {
                    return true;
                }
                return false;
            }, 'You must enter a last name')
        .validates('email')
            .using(function (value, attr, object) {
                if (object.individual.email
                        .match(regex.email)) {
                    return true;
                }
                return false;
            }, 'You must enter an email')
        .validates('zip_code')
            .required('You must eneter a zip code')
        .build();

    validators.institution = LGTM.validator()
        .validates('name')
            .required('You must enter a name')
        .build();

    return validators;
}
},{}]},{},[16])
;