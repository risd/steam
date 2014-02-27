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
        exploring_network = true;
        highlighted = x.steamie[0];
        // make it work
        if (x.tlg_id in data) {
            // already have some data

        } else {
            // not previously loaded
            data[x.tlg_id] = {
                total: sum_steamies(x.steamie[0].top_level),
                title: format_title(x.steamie[0].top_level),
                steamies: x.steamie,
                network: {}
            };
        }

        data[x.tlg_id].network.rendered = x.steamie;
        data[x.tlg_id].network.queued =
            [].concat(data[x.tlg_id].steamies);

        context.network
            .nodes(x.steamie)
            .title(data[x.tlg_id].title)
            .create();

        // load the rest of the steamies
        gather_steamies(x.tlg_id, 0);


        return self;
    };

    self.get = function (x) {
        exploring_network = true;
        // x is the properties attribute of the
        // geojson feature that was clicked

        // coming from this entry point, nothing is highlighted
        highlighted = undefined;

        if (x.tlg_id in data) {
            console.log('found steamie stash');
            // has been previously loaded

        } else {
            console.log('new steamie stash');
            // not previously loaded
            data[x.tlg_id] = {
                total: sum_steamies(x),
                title: format_title(x),
                steamies: [],
                network: {}
            };

        }

        data[x.tlg_id].network.rendered = [];
        data[x.tlg_id].network.queued =
            [].concat(data[x.tlg_id].steamies);

        context.network
            .title(data[x.tlg_id].title);

        gather_steamies(x.tlg_id, 0);

        return self;
    };

    function gather_steamies (tlg_id, offset) {
        console.log('gathering. current:');
        console.log(data[tlg_id].steamies);
        // number of items gathered in the request
        var count = 20;
        // gather steamies should orchestrate this.
        
        // if you have more steamies than your offset,
        // then you can dole them out here.
        if (data[tlg_id].network.queued.length > offset) {
            console.log('have steamies');
            // we have the steamies

            var steamies_to_add = data[tlg_id].network.queued
                                        .splice(offset, count);

            if (highlighted) {
                // ensure highlighted steamie
                // is not added as a dupe.
                steamies_to_add = steamies_to_add
                    .filter(function(d, i){
                        if (d.id !== highlighted.id) {
                            return d;
                        }
                    });
            }

            if (context.network.built()) {
                context.network.nodesPush(steamies_to_add);
            } else {
                context.network.nodes(steamies_to_add);
            }

            data[tlg_id].network.rendered =
                data[tlg_id].network
                              .rendered
                              .concat(steamies_to_add);

            var so_far = context.network.nodes().length;

            console.log('so far: ', so_far);
            console.log('total:  ', data[tlg_id].total);

            if ((so_far < data[tlg_id].total) &&
                (exploring_network)) {

                set_dispatch_to_gather_steamies(
                    tlg_id,
                    so_far);
            }

            render_new_steamies();

        } else {
            console.log('getting more steamies');
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

                if (results.objects.length === 0) return;

                console.log('results');
                console.log(results);

                steamies_to_add = results.objects;
                data[tlg_id].total = results.meta.total_count;

                if (highlighted) {
                    // ensure highlighted steamie
                    // is not added as a dupe.
                    steamies_to_add = steamies_to_add
                        .filter(function(d, i){
                            if (d.id !== highlighted.id) {
                                return d;
                            }
                        });
                }

                if (context.network.built()) {
                    context.network.nodesPush(steamies_to_add);
                } else {
                    context.network.nodes(steamies_to_add);
                }
                data[tlg_id].steamies = data[tlg_id].steamies
                                          .concat(steamies_to_add);
                data[tlg_id].network.rendered =
                        data[tlg_id].network
                                    .rendered
                                    .concat(steamies_to_add);

                var so_far = context.network.nodes().length;

                console.log('so far: ', so_far);
                console.log('total:  ', data[tlg_id].total);

                if ((so_far < data[tlg_id].total) &&
                    (exploring_network)) {

                    set_dispatch_to_gather_steamies(
                        tlg_id,
                        so_far);
                }

                render_new_steamies();
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

    function set_dispatch_to_gather_steamies (tlg_id,
                                              so_far) {

        console.log('setting dispatch to get more, maybe');

        var network_dispatch_event;
        if (context.network.built()) {
            network_dispatch_event = 'updated.storeGather';
        } else {
            network_dispatch_event = 'created.storeGather';
        }

        context.network
            .dispatch
            .on(network_dispatch_event, function () {
                context.network
                    .dispatch
                    .on(network_dispatch_event, null);


                gather_steamies(tlg_id, so_far);
            });
    }

    function render_new_steamies () {
        if (context.network.built()) {
            console.log('update');
            context.network.update();
        } else {
            console.log('create');
            context.network.create();
        }
    }

    function node_key (d) {
        return d.id;
    }

    return self;
}