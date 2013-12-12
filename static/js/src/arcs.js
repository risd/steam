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

                if (meta.prev_total_active !== meta.total_active) {
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
                }

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