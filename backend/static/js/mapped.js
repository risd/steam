(function () {
    var DEBUG = true;

    // mapped object holds all map.
    var mapped = window.mapped = {};

    mapped.map = undefined;
    mapped.data = {};

    // state of the filters for both
    // the map and the network graphs
    mapped.data.filters = [{
        abbr: 'res',
        display: 'Research',
        active: 1
    }, {
        abbr: 'edu',
        display: 'Education',
        active: 1
    }, {
        abbr: 'pol',
        display: 'Political',
        active: 1
    }, {
        abbr: 'ind',
        display: 'Industry',
        active: 1
    }];

    mapped.data.colors = {
        res: 'cyan',
        pol: 'magenta',
        edu: 'yellow',
        ind: 'grey'
    };

    // mapped.data.backend =
    //     'http://limitless-atoll-9939.herokuapp.com';
    mapped.data.backend = 'http://0.0.0.0:5000';

    mapped.fake = {
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

    // UI for manipulating data
    mapped.data.UI = function () {
        var ui = {},
            filters,   // reference to global filters
            network,   // reference to global network
            clusters,  // reference to global clusters
            clicked = 0;

        var filter_bar = d3.select('.filter_bar');

        ui.filter_bar = filter_bar;

        ui.filters = function (x) {
            if (!arguments.length) return filters;

            filters = x;

            return ui;
        };

        ui.network = function (x) {
            if (!arguments.length) return network;
            network = x;
            return ui;
        };

        ui.clusters = function (x) {
            if (!arguments.length) return clusters;
            clusters = x;
            return ui;
        };

        ui.init = function () {
            var filter_buttons = filter_bar.selectAll('.button')
                .data(filters)
                .enter()
                .append('div')
                .attr('class', function (d) {
                    return 'button active ' + d.abbr;
                })
                .text(function (d) {
                    return d.display;
                })
                .on('click', function (d) {
                    if (DEBUG) console.log('clicked');

                    if (clicked === 0) {
                        // first click selects just one segment
                        // so all filter states are set inactive,
                        // then this one is set active.

                        var i;
                        for (i=0; i < filters.length; i++) {
                            if (filters[i].abbr === d.abbr) {
                                filters[i].active = 1;

                            } else {

                                filters[i].active = 0;
                                if (DEBUG) console.log(
                                    d3.select(
                                        '.button.' +
                                        filters[i].abbr
                                    ).classed('active', false));
                            }
                        }
                    } else {
                        // subsequent clicks add or remove based
                        // on active state

                        // toggle state
                        d.active = d.active ? 0 : 1;

                        // toggle visual
                        d3.select(this)
                            .classed('active', d.active);
                    }

                    // apply filter to network and map
                    network.filter();
                    clusters.filter();

                    // up the click count, to enable
                    // secondary behavior
                    clicked += 1;
                });
        }

        return ui;
    };

    // visualization of the network
    mapped.Network = function () {
        var network = {},
            height = window.innerHeight,
            width = window.innerWidth,
            canvas_wrapper = d3.select('#steamie-network'),
            canvas,
            nodes,
            force,
            blurred_sel,
            focused_sel,
            top_level, // reference to global top_level
            map;       // reference to global map

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
            group_radius = 4,
            individual_radius = 5,
            blurred_radius = individual_radius/2,
            growth_radius = 2;

        network.map = function (x) {
            if (!arguments.length) return map;
            map = x;
            return network;
        };

        network.top_level = function (x) {
            if (!arguments.length) return top_level;
            top_level = x;
            return network;
        };

        network.filter = function () {
            try {
                // only include/exclude if there is
                // an instance of nodes having been
                // selected

                // not-active
                focused_sel = nodes_sel
                    .filter(function (d) {
                        return focused(d);
                    });

                blurred_sel = nodes_sel
                    .filter(function (d) {
                        return !focused(d);
                    });

                // active
                focused_sel
                    .transition()
                    .duration(1000)
                    .style('opacity', 1.0)
                    .attr('r', function (d) {
                        return radius(d) + growth_radius;
                    });

                // inactive
                blurred_sel
                    .transition()
                    .duration(1000)
                    .style('opacity', 0.2)
                    .attr('r', blurred_radius);

            } catch (e) {
                if (DEBUG) console.log(
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

            if (DEBUG) console.log(nodes);

            return network;
        };

        network.create = function () {
            if (DEBUG) console.log('nodes length');
            if (DEBUG) console.log(nodes.length);

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

            if (DEBUG) console.log('gravity');
            if (DEBUG) console.log(gravity);

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
                .append('circle')
                    .attr('class', function (d) {
                        return 'node ' +
                                d.work_in + ' ' +
                                d.type;
                    })
                    .attr('r', function (d) {
                        return radius(d);
                    })
                    .style('opacity', function (d) {
                        // account for mappe.data.filters value
                        // on creatation of graph

                        if (focused(d)) {
                            return 1;
                        } else {
                            return 0.2;
                        }
                    })
                    .call(force.drag)
                    .on('click', function (d) {
                        if (DEBUG) console.log('clicked');
                        if (DEBUG) console.log(d);
                    });

            force.on('tick', function () {
                nodes_sel
                    .attr('cx', function (d) { return d.x; })
                    .attr('cy', function (d) { return d.y; });
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

            // turn off outline of top_level area
            d3.select('.top_level.active')
                .classed('active', false);

            return network;
        };

        network.init = function (data) {
            // used to initialize a network graph
            // data is passed in from the cluster
            // group that is clicked.

            // zoom to area
            var padding = 0,
                area_of_interest = d3.select('.top_level.' + data.uid),
                aoi_bounds = d3.geo.bounds(area_of_interest.datum()),
                max_ne = new L.LatLng(aoi_bounds[1][1] + padding,
                                    aoi_bounds[1][0] + padding),
                max_sw = new L.LatLng(aoi_bounds[0][1] - padding,
                                    aoi_bounds[0][0] - padding),
                aoi_l_bounds = new L.LatLngBounds(max_sw, max_ne);

            // at end of zoom, highlight the area
            map.once('moveend', function () {
                if (DEBUG) console.log('focusing');
                if (DEBUG) console.log(area_of_interest);

                // reset the top_level svg
                top_level.reset();

                area_of_interest
                    .classed('active', true);
            });

            // move the map to fit the bounds
            map.fitBounds(aoi_l_bounds);

            // var data_url =
                // mapped.data.backend + '/api/' + uid + '/';
            // d3.json(data_url, function (err, network_data) {
            //     mapped.network
            //           .nodes(network_data)
            //           .create();
            // });
            var network_data = mapped.fake.network(data);
            if (DEBUG) console.log('steamies');
            if (DEBUG) console.log(network_data.steamies);
            network
                  .nodes(network_data.steamies)
                  .create();
        };

        function radius (d) {
            if (d.type === 'g') {
                return group_radius;
            } else{
                return individual_radius;
            }
        }

        function focused (d) {
            // returns true if focused
            // returns false if blurred
            var status = false,
                i;

            for (i=0; i < mapped.data.filters.length; i++) {
                if (mapped.data.filters[i].abbr ===
                        d.work_in) {

                    if (mapped.data.filters[i].active) {

                        return true;
                    }
                }
            }

            return false;
        }

        return network;
    };

    mapped.Map = function () {
        // returns leaflet map object
        // with properties set

        var zoomstart = function () {
            mapped.data.top_level.svg().classed('active', false);
        };

        var zoomend = function() {
            mapped.data.top_level.svg().classed('active', true);
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
        // actually resides, since its an svg overlay
        var max_south_west = new L.LatLng(-90, -240),
            max_north_east = new L.LatLng(90, 240),
            max_bounds = new L.LatLngBounds(
                max_south_west,
                max_north_east);

        map.setMaxBounds(max_bounds);

        return map;
    };

    mapped.Clusters = function () {

        var clusters = {},
            network, // reference to network object
            map,     // reference to map object
            filters, // reference to filters object
            geojson, // L.geojson of data
            data,    // raw data
            max;     // max of data

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

                var steamie_count = 0;
                var children = cluster.getAllChildMarkers(),
                    child_count = cluster.getChildCount();

                for (var i = 0; i < children.length; i++) {
                    steamie_count += calculate_steamies(
                                        children[i].feature);
                }



                var c = ' marker-cluster-',
                    max = clusters.max();

                if (steamie_count <
                            (max * 0.3)) {
                    c += 'small';
                } else if (steamie_count <
                            (max * 0.6)) {
                    c += 'medium';
                } else {
                    c += 'large';
                }

                if (child_count === 1) {
                    c += ' represents-one-entity';
                } else {
                    c += ' represents-multiple-entities';
                }

                return new L.DivIcon({
                    html: '<div><span>' +
                        steamie_count + '</span></div>',
                    className: 'marker-cluster' + c,
                    iconSize: new L.Point(40, 40)
                });
            },

            // for the polygon that shows the area
            // of entities captured
            polygonOptions: {
                color: 'red',
                fillColor: 'red'
            }
        });

        // on click of individual clusters
        clusters_group.on('click', function (item) {
            // click cluster
            if (DEBUG) console.log(item.layer.feature.properties);

            network.init(item.layer.feature.properties);
        });

        clusters_group.on('clusterclick', function (d) {
            if (DEBUG) console.log('cluster clicked!');
            var bounds = d.layer.getBounds().pad(0.5);
            map.fitBounds(bounds);
        });

        clusters.network = function (x) {
            // pass the network object
            // to be able to initiate network graphs
            if (!arguments.length) return network;

            network = x;

            return clusters;
        };

        clusters.map = function (x) {
            // pass map object that references
            // the global map
            if (!arguments.length) return map;
            map = x;
            return clusters;
        };

        clusters.filters = function (x) {
            // pass filters object that tracks
            // the state of filters
            if (!arguments) return filters;
            filters = x;
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
            if (DEBUG) console.log('filtering');

            clusters.clear();
            add_to_map();

            return clusters;
        };

        clusters.clear = function () {
            // remove cluster layers
            clusters_group.clearLayers();

            map.removeLayer(clusters_group);

            return clusters;
        };

        clusters.max = function () {
            // find max count to set symbology relative
            // to the max value.

            return d3.max(data.features, function (d) {
                return calculate_steamies(d);
            });
        };

        function add_to_map () {
            if (DEBUG) console.log('adding clusters to map');
            if (DEBUG) console.log(data);

            geojson = L.geoJson(data);

            clusters_group.addLayer(geojson);

            map.addLayer(clusters_group);
        }

        function calculate_steamies (d) {
            var total = 0;
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].active) {
                    total += d.properties[filters[i].abbr];
                }
            }

            return total;
        }

        return clusters;
    };

    mapped.data.TopLevel = function () {
        var top_level = {},
            top_level_bounds,
            top_level_path,
            top_level_sel,
            top_level_tj,
            data,
            map,               // reference to map object
            top_level_svg = d3
                .select(mapped
                        .map.getPanes().overlayPane)
                    .append('svg')
                    .attr('class', 'top_level_svg'),

            top_level_g = top_level_svg.append('g');

        top_level.svg = function () {
            return top_level_svg;
        };

        top_level.data = function (x) {
            if (!arguments.length) return data;

            data = x;

            top_level_tj = topojson
                .feature(
                    data,
                    data.objects.level_1);

            top_level_bounds = d3.geo.bounds(top_level_tj);
            top_level_path = d3.geo.path().projection(project);

            top_level_sel = top_level_g.selectAll('top_level')
                .data(top_level_tj.features)
                .enter()
                .append('path')
                .attr('class', function (d,i) {
                    return 'top_level ' + d.properties.uid;
                });
            reset();

            return top_level;
        };

        top_level.map = function (x) {
            if (!arguments.length) return map;

            map = x;

            return top_level;
        };

        // use leaflet to implement d3 geo projection
        function project (x) {
            var point = map
                            .latLngToLayerPoint(
                                new L.LatLng(x[1], x[0]));
            return [point.x , point.y];
        }

        function reset () {
            var top_level_bottom_left =
                    project(top_level_bounds[0]),
                top_level_top_right =
                    project(top_level_bounds[1]);

            top_level_svg
                .attr('width',
                    top_level_top_right[0] - top_level_bottom_left[0])
                .attr('height',
                    top_level_bottom_left[1] - top_level_top_right[1])
                .style('margin-left',
                    top_level_bottom_left[0] + 'px')
                .style('margin-top',
                    top_level_top_right[1] + 'px');

            top_level_g
                .attr('transform', 'translate(' +
                    -top_level_bottom_left[0] + ',' +
                    -top_level_top_right[1] + ')');

            top_level_sel.attr('d', top_level_path);
        }

        top_level.reset = reset;

        return top_level;
    };

    mapped.Form = function () {
        var form = {},
            state,         // current state
            child_window,  // ref to the popup window object
            child_status;  // set interval function to check

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

        var el = {
            button: {
                deactivate: d3.select('#close-modal-add-yourself'),

                activate: d3.select('#activate-add-yourself'),

                type_choice_individual:
                    d3.select('#add-yourself-type-individual'),

                type_choice_institution:
                    d3.select('#add-yourself-type-institution'),

            },
            display: {
                modal: d3.select('#modal-add-yourself'),
                login_choices: d3.select('#add-yourself-login'),
                type_choices: d3.select('#add-yourself-types'),
                form_individual:
                    d3.select('#add-yourself-individual-form-wrapper'),
                form_institution:
                    d3.select('#add-yourself-institution-form-wrapper')
            }
        };

        var states = {
            inactive: function () {
                el.display
                    .modal
                    .classed('active', false);

                el.display
                    .login_choices
                    .classed('active', false);

                el.display
                    .type_choices
                    .classed('active', false);

                el.display
                    .form_individual
                    .classed('active', false);

                el.display
                    .form_institution
                    .classed('active', false);
            },
            choose_login: function () {
                el.display
                    .modal
                    .classed('active', true);

                el.display
                    .login_choices
                    .classed('active', true);

                el.display
                    .type_choices
                    .classed('active', false);

                el.display
                    .form_individual
                    .classed('active', false);

                el.display
                    .form_institution
                    .classed('active', false);
            },
            choose_type: function () {
                if (DEBUG) console.log('choose type');
                el.display
                    .modal
                    .classed('active', true);

                el.display
                    .login_choices
                    .classed('active', false);

                el.display
                    .type_choices
                    .classed('active', true);

                el.display
                    .form_individual
                    .classed('active', false);

                el.display
                    .form_institution
                    .classed('active', false);
            },
            fill_out_individual: function () {

                el.display
                    .modal
                    .classed('active', true);

                el.display
                    .login_choices
                    .classed('active', false);

                el.display
                    .type_choices
                    .classed('active', false);

                el.display
                    .form_individual
                    .classed('active', true);

                el.display
                    .form_institution
                    .classed('active', false);

            },
            fill_out_institution: function () {
                
                el.display
                    .modal
                    .classed('active', true);

                el.display
                    .type_choices
                    .classed('active', false);

                el.display
                    .form_individual
                    .classed('active', false);

                el.display
                    .form_institution
                    .classed('active', true);
            }
        };

        var login = [{
            'name': 'Twitter',
            'url': mapped.data.backend + '/login/twitter/'
        },{
            'name': 'Facebook',
            'url': mapped.data.backend + '/login/facebook/'
        },{
            'name': 'Google',
            'url': mapped.data.backend + '/login/google-oauth2/'
        }];

        form.state = function (x) {
            if (!arguments.length) return state;

            if (x in states) {
                state = x;
                states[state]();
            }

            return form;
        };


        form.init = function () {
            el.button
                .activate
                .on('click', function () {
                    form.state('choose_login');
                });

            el.button
                .type_choice_institution
                .on('click', function () {
                    form.state('fill_out_institution');
                });

            el.button
                .type_choice_individual
                .on('click', function () {
                    form.state('fill_out_individual');
                });

            el.button
                .deactivate
                .on('click', function () {
                    form.state('inactive');
                });

            d3.select('#add-yourself-login')
                .selectAll('.login-option')
                .data(login)
                .enter()
                .append('div')
                .attr('class', 'login-option')
                .attr('id', function (d) {
                    return 'add-yourself-login-' +
                        d.name.toLowerCase();
                })
                .on('click', function (d) {
                    if (DEBUG) console.log('opening ', d.url);

                    var popup = ui.popup_window_properties(),

                        window_features =
                            'width=' + popup.width + ',' +
                            'height=' + popup.height + ',' +
                            'left=' + popup.x + ',' +
                            'top=' + popup.y;

                    child_window =
                        window.open(d.url, '',  window_features);

                    child_status = setInterval(check_child, 1000);
                })
                .text(function (d) {
                    return d.name;
                });

            form.state('inactive');

            return form;
        };

        function check_child () {
            if (child_window.closed) {
                if (DEBUG) console.log('child closed');
                // stop checking for the child window status
                clearInterval(child_status);

                // check to see if auth occured
                mapped.user.check_auth();
            } else {
                if (DEBUG) console.log('child open');
            }
        }

        return form;
    };

    mapped.User = function () {
        var user = {},
            form,     // mapped.form object
            authed,   // true/false
            uid;      // user id

        user.check_auth = function () {
            // checks the server to see if user
            // is authenticated
            // depending on response, sets state
            // of the form.

            var url = mapped.data.backend + '/authed/';
            d3.json(url, function (err, status) {
                if (DEBUG) console.log('checking auth');
                if (DEBUG) console.log(status);

                if (status.authenticated) {
                    // response should inform if user
                    // - is on the map OR not.

                    if (status.type === 'individual') {
                        form.state('fill_out_individual');
                    } else if (status.type === 'institution') {
                        form.state('fill_out_institution');
                    } else {
                        form.state('choose_type');
                    }
                }
            });

            return user;
        };

        user.form = function (x) {
            if (!arguments.length) return form;

            form = x;

            return user;
        };

        user.authed = function (x) {
            if (!arguments.length) return authed;

            authed = x;

            return user;
        };

        user.uid = function (x) {
            if (!arguments.length) return uid;

            uid = x;

            return user;
        };

        return user;
    };

    mapped.map = mapped.Map();

    mapped.data.top_level = mapped.data
                                  .TopLevel()
                                  .map(mapped.map);

    mapped.network = mapped.Network()
                           .map(mapped.map)
                           .top_level(mapped.data.top_level);
   
   mapped.clusters = mapped.Clusters()
                           .network(mapped.network)
                           .map(mapped.map)
                           .filters(mapped.data.filters);

   mapped.data.ui = mapped.data.UI()
                          .filters(mapped.data.filters)
                          .network(mapped.network)
                          .clusters(mapped.clusters)
                          .init();

    mapped.form = mapped.Form()
                        .init();

    mapped.user = mapped.User()
                        .form(mapped.form);

    

    mapped.init = function () {
        // start the project

        // load level_1_point data that will be
        // clustered on the map.
        d3.json('/static/geo/fake_level_1_pnt.geojson',
                mapped.clusters.data);

        // load level_1 topojson that represents
        // each of the level_1 areas.
        d3.json('/static/geo/level_1.topojson',
            mapped.data.top_level.data);

        mapped.user.check_auth();
    }();
})();