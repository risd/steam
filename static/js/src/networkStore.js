module.exports = NetworkStore;

// Stash results from network graphs
function NetworkStore (context) {

    var self = {},
        // stored by id
        // {
        //     <tlgid>: {
        //         total: <int>,
        //         steamies: [],
        //         title: ,
        //     }
        // },
        request,
        data = {};

    self.highlight = function (x) {
        // make it work
    };

    self.get = function (x) {
        console.log('network store get');
        console.log(x);

        // x is the dat to initiliaze the business
        // {
        //     tlg_id: ,       <- required
        //     steamie_id: ,   <- optional, highlight
        //     steamie_type: , <- optional, highlight 
        // }

        if (x.tlg_id in data){
            var current = data[x.tlg_id];
            // has been previously loaded
            context.network
                .nodes(current.steamies)
                .title(current.title)
                // highlight?
                .create();
            

            // more to load?
            if (current.total === current.steamies.length) {
                // all loaded
            } else {
                // load more
                gather_steamies(
                    x.tlg_id,
                    current.steamies.length);
            }
        } else {
            // not previously loaded
            data[x.tlg_id] = {
                total: undefined,
                title: undefined,
                steamies: []
            };

            gather_steamies(x.tlg_id, 0);
        }
        return self;
    };

    function gather_steamies (tlg_id, offset) {
        var args = {
            tlg_id: tlg_id,
            offset: offset
        };
        if (request) {
            request.abort();
        }
        request = context.api
            .network_steamies_request(args, function (err, results) {
                console.log('returned data');
                console.log(results);

                var current = data[tlg_id];

                var so_far = add_steamies(current, results.steamies);

                if (!(current.title)) {
                    network_title(current, format_title(results));
                }
                if (!(current.total)) {
                    current.total = sum_steamies(results);
                }

                if (context.network.built()) {
                    context.network.update();
                } else {
                    context.network.create();
                }

                if (so_far !== data[tlg_id].total) {
                    make_request(tlg_id, so_far);
                }
            });
    }

    function network_title (current, title) {
        current.title = title;
        context.network.title(title);
    }

    function add_steamies (current, steamies) {
        current.steamies = current.steamies.concat(steamies);
        context.network.nodes(current.steamies);
        return current.steamies.length;
    }

    function sum_steamies(x) {
        return x.work_in_education +
               x.work_in_research +
               x.work_in_political +
               x.work_in_industry;
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

    return self;
}