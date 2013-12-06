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