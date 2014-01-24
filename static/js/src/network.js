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