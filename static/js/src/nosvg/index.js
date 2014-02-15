var polyfills = require('../polyfills'),
    filters = require('../filters'),
    colors = require('../colors'),
    clone = require('../util/clone'),
    api = require('../util/backend')(),
    network = require('../network'),
    modal_flow = require('./modalFlow'),
    user = require('../user/user'),
    getTSV = require('../util/getTSV');

polyfills();

STEAMMap();

function STEAMMap() {
    var context = {};

    context.clone = clone;
    context.api = api;
    context.filters = filters;
    context.colors = colors;

    context.countries = getTSV(context.api.base +
                               '/static/geo/countries.tsv');

    context.network = network(context)
                        .display('list')
                        .renderSvg(false);

    context.filterUI = filterUI(context).filterable(false);
    context.modal_flow = modal_flow(context);
    context.user = user(context);

   function init () {

        context.user.check_auth();
    }

    init();
}