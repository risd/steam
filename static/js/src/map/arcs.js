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

    arcs.draw = function () {
        console.log('draw');

        // adding arcs
        d3.selectAll('.marker-cluster')
            .each(draw);
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
        // 'defaulted'
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
                node_data[j].status = 'defaulted';
            }
            if (prev_active_count === 4) {
                node_data[j].prev_status = 'defaulted';
            }

        }

        // return node_data;
    }

    function draw (d, i) {
        var node = d3.select(this);
        var node_data = d;
        var svg_wrapper = node.select('.arc-wrapper');
        var svg = svg_wrapper.select('svg');
        var g = svg_wrapper.select('g');

        if (svg.node()) {
            // if there is an svg, that means that
            // the data has not been updated.
            // since the markerclustergroup will
            // redraw all of the clusters if the
            // data is changed, which would
            // mean there is no svg node.
            return;
        }
        
        // there is NO an svg here
        svg_dimensions = [{
            dimensions:
                context.icon_size[node_data
                                   .meta
                                   .icon_category].total
           }];

        svg = svg_wrapper.selectAll('svg')
            .data(svg_dimensions)
            .enter()
            .append('svg')
            .attr('class', 'arc-svg')
            .attr('width', function (d) {
                return d.dimensions;
            })
            .attr('height', function (d) {
                return d.dimensions;
            });

        g = svg.selectAll('g')
            .data(svg_dimensions)
            .enter()
            .append('g')
            .attr('transform', function (d) {
                return 'translate(' +
                  d.dimensions / 2 + ',' +
                  d.dimensions / 2 + ')';
            });

        g.append('rect')
            .attr('class', 'blanket')
            .attr('height', svg_dimensions[0].dimensions)
            .attr('width', svg_dimensions[0].dimensions);

        // add the prev_status, and status
        // attributes to the data object
        // for appropriate scaling based on
        // the filter settings
        add_status(node_data.filters);

        // update the domain to set the
        // arc start and end angles
        arc_scale.domain([0, node_data.meta.total]);

        // add arc specific data to the
        // data to be bound and drawn.
        var accounted_for = 0;
        node_data.filters.forEach(function (d, i) {
            d.startAngle = accounted_for;

            var slice = arc_scale(d.count);
            accounted_for += slice;
            
            d.endAngle = accounted_for;

            d.innerRadius = context.icon_size
                                [node_data.meta.icon_category]
                                [d.prev_status]
                                .innerRadius;
            d.outerRadius = context.icon_size
                                [node_data.meta.icon_category]
                                [d.prev_status]
                                .outerRadius;
        });
        
        var arc_sel = g.selectAll('.arc-segment')
            .data(node_data.filters)
            .enter()
            .append('path')
            .attr('class', 'arc-segment')
            .style('fill', function (d) {
                return context.colors[d.value];
            })
            .attr('d', arc);

        
        var span_sel = node
            .selectAll('span')
            .datum({
                start: node_data.meta.prev_total_active,
                end: node_data.meta.total_active
            });

        d3.transition()
            .duration(800)
            .each(function () {
                // text transition is a little misleading.
                // on zoom, its not actually counting from
                // the parent cluster total to the individual
                // child cluster values. its just taking those
                // child cluster values, and animating between
                // the prev_active_total (which was never seen
                // by the user), and the active_total, which
                // the user is about to see.
                // not a show stopper for now.
                d3.transition(span_sel)
                    .tween('text', function (d) {
                        var i = d3.interpolateRound(d.start,
                                                    d.end);
                        return function (t) {
                            this.textContent = format(i(t));
                        };
                    });

                d3.transition(arc_sel)
                    .attrTween('d', tweenArc(function (d, i) {
                        return {
                            innerRadius:
                                context.icon_size
                                   [node_data.meta.icon_category]
                                   [d.status]
                                   .innerRadius,
                            outerRadius:
                                context.icon_size
                                   [node_data.meta.icon_category]
                                   [d.status]
                                   .outerRadius
                        };
                    }));
            });
    }

    return arcs;
}