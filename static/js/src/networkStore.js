module.exports = NetworkStore;

// Stash results from network graphs
function NetworkStore (context) {

    var self = {},
        // stored by id
        // steamies are all of the steamies
        // queued is an array of steamies that
        //   are yet to be drawn
        // title is the title of the network graph
        // {
        //     <tlgid>: {
        //         total: <int>,
        //         steamies: [],
        //         queued: [],
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

    // self.nodes = function (tlg_id, current_nodes) {
    //     if (!arguments.length) return self;
    //     if (arguments.length === 1) return data[x];
    //     return self;
    // };

    self.abort = function () {
        if (steamie_request) {
            steamie_request.abort();
        }
    };

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
        context.network
            .nodes([])
            .nodesToExpect(0);
        exploring_network = true;
        highlighted = x.steamie[0];
        // make it work
        if (x.tlg_id in data) {
            // already have some data

            context.network
                   .nodesToExpect(data[x.tlg_id].total);
        } else {
            // not previously loaded
            data[x.tlg_id] = {
                total: sum_steamies(x.steamie[0].top_level),
                title: format_title(x.steamie[0].top_level),
                steamies: x.steamie
            };
        }

        var steamie_index = 0;
        data[x.tlg_id].steamies.forEach(function (d, i) {
            if (d.id === highlighted.id) steamie_index = i;
        });


        // data[x.tlg_id].network.rendered = x.steamie;
        data[x.tlg_id].queued = [].concat(
            data[x.tlg_id].steamies.slice(
                steamie_index, (steamie_index + 1)),
            data[x.tlg_id].steamies.slice(
                0, steamie_index),
            data[x.tlg_id].steamies.slice(
                steamie_index + 1, data[x.tlg_id].steamies.length));

        context.network
            .title(data[x.tlg_id].title);

        // load the rest of the steamies
        gather_steamies(x.tlg_id, 0);

        return self;
    };

    self.get = function (x) {
        context.network
            .nodes([])
            .nodesToExpect(0);
        exploring_network = true;
        // x is the properties attribute of the
        // geojson feature that was clicked

        // coming from this entry point, nothing is highlighted
        highlighted = undefined;

        if (x.tlg_id in data) {
            // has been previously loaded
            context.network
                   .nodesToExpect(data[x.tlg_id].total);

        } else {
            // not previously loaded
            data[x.tlg_id] = {
                total: sum_steamies(x),
                title: format_title(x),
                steamies: []
            };

        }

        data[x.tlg_id].queued =
            [].concat(data[x.tlg_id].steamies);

        context.network
            .title(data[x.tlg_id].title);

        gather_steamies(x.tlg_id, 0);

        return self;
    };

    function gather_steamies (tlg_id, offset) {
        console.log('gathering. current:');
        // number of items gathered in the request
        var count = 20;
        // gather steamies should orchestrate this.
        
        // if you have more steamies than your offset,
        // then you can dole them out here.
        if (data[tlg_id].queued.length > 0) {
            // we have the steamies

            context.network.nodesPush(data[tlg_id].queued);

            data[tlg_id].queued = [];

            var so_far = context.network.nodes().length;

            console.log('so far: ', so_far);
            console.log('total:  ', data[tlg_id].total);

            if ((so_far <
                    (data[tlg_id].total -
                     (highlighted ? 1 : 0))) &&
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

                steamies_to_add = results.objects;
                data[tlg_id].total = results.meta.total_count;
                context.network
                       .nodesToExpect(results.meta.total_count);

                // if (highlighted) {
                //     // ensure highlighted steamie
                //     // is not added as a dupe.
                //     steamies_to_add = steamies_to_add
                //         .filter(function(d, i){
                //             if (d.id !== highlighted.id) {
                //                 return d;
                //             } else {
                //                 console.log('filtering');
                //                 console.log(d);
                //             }
                //         });
                // }

                context.network.nodesPush(steamies_to_add);

                console.log('added steamies: ',
                             steamies_to_add.length);

                data[tlg_id].steamies = context.network.nodes();

                var so_far = data[tlg_id].steamies.length;

                console.log('so far: ', so_far);
                console.log('total:  ', data[tlg_id].total);

                if ((so_far <
                        (data[tlg_id].total -
                         (highlighted ? 1 : 0))) &&
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

                // get more steamies after the latest
                // ones are drawn.
                gather_steamies(tlg_id, so_far);
            });
    }

    function render_new_steamies () {
        if (context.network.built()) {
            context.network.update();
        } else {
            context.network.create();
        }
    }

    function node_key (d) {
        return d.id;
    }

    return self;
}