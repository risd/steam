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