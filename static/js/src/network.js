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
        grid_sel,
        // name of the overlay
        title,
        title_wrapper_sel,
        request,
        built = false,
        network_display = 'force',
        network_options = ['force', 'list'],
        network_create = {
            'force': force_create,
            'list': list_create
        },
        network_remove = {
            'force': force_remove,
            'list': list_remove
        },
        network_filter = {
            'force': force_filter,
            'list': list_filter
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
            default: 1,
            unselected: 0.666666667,
            selected: 1.333333333
        },
        opacity = {
            default: 1,
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

        title_wrapper_sel = canvas_wrapper
            .append('div')
                .attr('class', 'header-wrapper');

        grid_sel = title_wrapper_sel
            .append('div')
                .attr('class', 'grid full-width clearfix');

        var four_col_sel = grid_sel
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

        grid_sel
            .append('div')
                .attr('class', 'one-column omega')
            .append('div')
                .attr('class', 'close-button desktop')
                .on('click', function () {
                    network.remove();
                })
                .call(svg_cross);

        var buttons_sel = grid_sel
            .append('div')
                .attr('class', 'four-column offset-one '+
                               'network-button-wrapper clearfix');
        var buttons = buttons_sel
            .selectAll('.network-display-button')
            .data([{
                klass: 'force',
                click: function () {
                    network.display('force')
                        .remove()
                        .create();
                }
            }, {
                klass: 'list',
                click: function () {
                    network.display('list')
                        .remove()
                        .create();
                }
            }])
            .enter()
            .append('a')
            .attr('class', function (d) {
                return 'network-display-button ' + d.klass;
            })
            .on('click', function (d) {
                d.click();
            });

        // end create divs

        network_create[network_display]();
        
        built = true;
        dispatch.create();

        return network;
    };

    network.display = function (x) {
        if (!arguments.length) return network_display;
        network_display = x;
        return network;
    };

    network.remove = function () {
        // no draw on the map
        // d3.select('#steam-map').classed('active', true);

        network_remove[network_display]();

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

                d3.transition(title_wrapper_sel)
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
            var highlight_node = nodes_sel.filter(function (d,i) {
                if (d[data.steamie_type]) {
                    return d[data.steamie_type].id ===
                            data.steamie_id;
                }
            });
            highlight_node.each(highlight);

            // reset the dispatch;
            // dispatch.on('create.highlight', null);
        });
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
                .on('click', highlight)
                .call(add_symbols);

        force.start();
        force.on('tick', function () {
            nodes_sel
                .attr('transform', transform);
        });
    }

    function list_create () {

        var svg_dimensions = ((radius_outter * 2) * scale['selected']);

        var list_col_sel = grid_sel.append('div')
            .attr('class', 'four-column clearfix offset-one');

        nodes_sel = list_col_sel.selectAll('.steamie')
            .data(nodes)
            .enter()
            .append('div')
            .each(function (d, i) {
                if (active(d)) {
                    d.status = 'selected';
                } else {
                    d.status = 'unselected';
                }
                d.x = 0;
                d.y = 0;
            })
            .attr('class', function (d) {
                return 'steamie ' + d.status;
            });

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

            nodes_sel.attr('class', function (d) {
                return 'steamie ' + d.status;
            });
        } catch (e) {
            console.log('Can not filter the non non-existent list');
        }
    }

    function force_remove () {

    }

    function force_filter () {
        try {
            // only include/exclude if there is
            // an instance of nodes having been
            // selected

            update_node_status();

            nodes_sel
                .transition()
                .duration(1000)
                .style('opacity', set_opacity)
                .attr('transform', transform);

        } catch (e) {
            console.log(
                'Can not filter the non-existent network.');
        }
    }

    function list_remove () {

    }

    function steamie_name (d) {
        var name;
        if (d.type === 'individual') {
            name = (d.individual.first_name || '') + ' ' +
               (d.individual.last_name || '');
        } else if (d.type === 'institution') {
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

    function update_node_status () {
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
    }

    return network;
}