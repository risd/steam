module.exports = NetworkStore;

// Stash results from network graphs
function NetworkStore (context) {

    var self = {},
        // stored by id
        // steamies are all of the steamies
        // network is two arrays of the steamies
        //   rendered are already in the network graph
        //   queued are waiting to be added
        // title is the title of the network graph
        // {
        //     <tlgid>: {
        //         total: <int>,
        //         steamies: [],
        //         network: {
        //             rendered: [],
        //             queued: []
        //         },
        //         title: ,
        //     }
        // },
        steamie_request,
        highlighted,
        tlg_request,
        // flag for controlling a continuous cycle
        // of gathering steamies for networks
        // that may already be closed
        exploring_network = false,
        data = {},
        network_dispatch;

    self.networkDispatch = function (x) {
        if (!arguments.length) return network_dispatch;
        network_dispatch = x;

        network_dispatch
            .on('removed.store', function () {
                exploring_network = false;
            })
            .on('created.store', function () {
                exploring_network = true;
            });

        return self;
    };

    self.highlight = function (x) {
        console.log('highlight x');
        console.log(x);
        highlighted = x.steamie[0];
        // make it work
        var current = null;
        if (x.tlg_id in data) {
            // already have some data
            current = data[x.tlg_id];

        } else {
            // not previously loaded
            current = data[x.tlg_id] = {
                total: sum_steamies(x.steamie[0].top_level),
                title: format_title(x.steamie[0].top_level),
                steamies: x.steamie
            };
        }

        context.network
            .nodes(x.steamie)
            .title(current.title)
            .create();

        // load the rest of the steamies
        gather_steamies(current, x.tlg_id, 0);


        return self;
    };

    self.get = function (x) {
        // x is the properties attribute of the
        // geojson feature that was clicked

        // coming from this entry point, nothing is highlighted
        highlighted = undefined;

        var current = null;

        if (x.tlg_id in data) {
            // has been previously loaded
            current = data[x.tlg_id];

        } else {
            // not previously loaded
            data[x.tlg_id] = current = {
                total: sum_steamies(x),
                title: format_title(x),
                steamies: []
            };

        }

        context.network
            .title(current.title);

        gather_steamies(current, x.tlg_id, 0);

        return self;
    };

    // function get_tlg_meta (tlg_id) {
    //     if (tlg_request) {
    //         tlg_request.abort();
    //     }

    //     tlg_request = context.api
    //         .toplevelgeo_request(tlg_id, function (err, results) {
    //             dispatch.attainTLG(results);
    //         });
    // }

    function gather_steamies (current, tlg_id, offset) {
        console.log('gathering');
        // number of items gathered in the request
        var count = 20;
        // gather steamies should orchestrate this.
        
        // if you have more steamies than your offset,
        // then you can dole them out here.
        if (current.steamies.length > offset) {
            // we have the steamies
            var steamies_to_add = current.steamies
                                        .splice(offset, count);
            var current_nodes = context.network.nodesSelData();
            console.log('current_nodes');
            console.log(current_nodes);

            current_nodes = current_nodes.concat(steamies_to_add);
            context.network.nodes(current_nodes);

            var so_far = current_nodes.length;

            var network_dispatch_event =
                set_network_dispatch_event();
            console.log('so_far', so_far);
            console.log('current.total', current.total);

            // THIS IS A PROBLEM
            // current.total is greater than so_far,
            // because i moved my steamie from one
            // location to another.
            // so, if someone updates their position
            // we don't want to get stuck in a weird
            // cycle. so having an accurate current.total
            // value will be important.
            // another end point for just that?
            // it would be nice if our total in .meta
            // was actually acurate. could work toward
            // that. but its an expense call to make,
            // is the whole point. since there are so
            // many to count.

            // PERHAPS
            // try having the request for steamies
            // include a total count.
            // work_in_X numbers would even work
            // just can't depend on the geojson
            // marker to have the exact number, since
            // its written at an interval of 1 min.
            if ((so_far < current.total) &&
                (exploring_network)) {

                console.log('needs more steamies');

                set_dispatch_to_gather_steamies(
                    network_dispatch_event,
                    current,
                    tlg_id,
                    so_far);
            }

        } else {
            // we dont have the steamies, yet
            // if you need to request more steamies, get'em here
            var request_args = {
                tlg_id: tlg_id,
                offset: offset
            };
            if (steamie_request) {
                steamie_request.abort();
            }
            steamie_request = context.api
                .network_steamies_request(
                    request_args,
                    function (err, results) {

                new_steamies = results.steamies;

                if (highlighted) {
                    // ensure highlighted steamie
                    // is not added as a dupe.
                    new_steamies = new_steamies
                        .filter(function(d, i){
                            if (d.id !== highlighted.id) {
                                return d;
                            }
                        });
                }
                console.log('returned data');
                console.log(results);

                context.network.nodesPush(new_steamies);

                var so_far = context.network.nodes().length;

                var network_dispatch_event =
                    set_network_dispatch_event();

                if ((so_far < current.total) &&
                    (exploring_network)) {

                    set_dispatch_to_gather_steamies(
                        network_dispatch_event,
                        current,
                        tlg_id,
                        so_far);
                }
            });
        }
    }

    function sum_steamies(x) {
        // geojson does not have the prefix
        // data from the server will
        var prefix = '';
        if ('work_in_education' in x) {
            prefix = 'work_in_';
        }
        return x[prefix + 'education'] +
               x[prefix + 'research'] +
               x[prefix + 'political'] +
               x[prefix + 'industry'];
    }

    function format_title (x) {
        var title;
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
        return title;
    }

    function set_network_dispatch_event () {
        var network_dispatch_event;
        if (context.network.built()) {
            context.network.update();
            network_dispatch_event = 'updated.storeGather';
        } else {
            context.network.create();
            network_dispatch_event = 'created.storeGather';
        }
        return network_dispatch_event;
    }

    function set_dispatch_to_gather_steamies (network_dispatch_event,
                                              current,
                                              tlg_id,
                                              so_far) {

        context.network
            .dispatch
            .on(network_dispatch_event, function () {
                context.network
                    .dispatch
                    .on(network_dispatch_event, null);


                gather_steamies(current, tlg_id, so_far);
            });

    }

    function node_key (d) {
        return d.id;
    }

    return self;
}