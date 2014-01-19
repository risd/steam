var filters = require('./filters'),
    colors = require('./colors'),
    clone = require('./clone'),
    icon_size = require('./clusterIconSize')(),

    api = require('./backend')(),

    filterUI = require('./filterUI'),
    network = require('./network'),
    clusters = require('./clusters'),
    arcs = require('./arcs'),
    map = require('./map'),
    getTSV = require('./getTSV'),

    modal_flow = require('./modalFlow'),
    user = require('./user'),

    fake = require('./fakeDataGenerator');

STEAMMap();

function STEAMMap() {
    var context = {};

    // util
    context.clone = clone;
    context.fake = fake;

    // data
    context.api = api;
    context.prev_filters = clone(filters);
    context.filters = filters;
    context.colors = colors;
    context.icon_size = icon_size;

    context.countries = getTSV(context.api.base +
                               '/static/geo/countries_geocodable.tsv');

    // ui
    context.network = network(context);
    context.clusters = clusters(context);
    context.arcs = arcs(context);
    context.filterUI = filterUI(context);
    context.map = map(context);
    context.modal_flow = modal_flow(context);
    context.user = user(context);

    function init () {
        context.clusters
            .bindArcs()
            .init();
        context.filterUI.init();
        context.modal_flow.init();
        context.user.check_auth();
    }

    init();
}