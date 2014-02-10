var filters = require('./filters'),
    colors = require('./colors'),
    clone = require('./util/clone'),
    icon_size = require('./clusterIconSize')(),

    api = require('./backend')(),

    Nav = require('./nav'),
    filterUI = require('./filterUI'),
    network = require('./network'),
    clusters = require('./clusters'),
    arcs = require('./arcs'),
    map = require('./map'),
    getTSV = require('./util/getTSV'),

    modal_flow = require('./modalFlow'),
    user = require('./user');

STEAMMap();

function STEAMMap() {
    var context = {};

    // util
    context.clone = clone;

    // data
    context.api = api;
    context.prev_filters = clone(filters);
    context.filters = filters;
    context.colors = colors;
    context.icon_size = icon_size;

    context.countries = getTSV(context.api.base +
                               '/static/geo/countries.tsv');

    // ui
    context.network = network(context);
    context.clusters = clusters(context);
    context.arcs = arcs(context);
    context.filterUI = filterUI(context);
    context.map = map(context);
    context.modal_flow = modal_flow(context);
    context.user = user(context);

    function init () {
        context.nav = Nav()
            .container(d3.select('.main-nav-container'))
            .toggleMobile(d3.select('.mobile-logo'))
            .mobileHiddenClass('mobile-hidden')
            .blanket(d3.select('.mobile-blanket'))
            .blanketClass('blanketed')
            .scrollDistanceHideMobile(100)
            .setup();

        context.clusters
            .bindArcs()
            .init();
        context.filterUI.init();
        context.modal_flow.init();

        // modal_flow dispatches on
        // check auth being completed
        // and sets the modal form flow
        // to the position it should be in
        context.user.check_auth();
    }

    init();
}