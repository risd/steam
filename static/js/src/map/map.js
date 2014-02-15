module.exports = Map;

// returns leaflet map object
function Map (context) {

    var zoomstart = function () {
        // so that the zoom does make things re-filter
        context.prev_filters = context.clone(context.filters);
    };

    var zoomend = function() {
        // console.log('zoomlevel: ', map.getZoom());
    };

    //// Mapbox
    // var mabox_id = "",
    var mabox_id = "mgdevelopers.map-6m0pmhd7",
        map = L.mapbox
            .map('steam-map', mabox_id, {
                'maxZoom': 12
            })
            .setView([39.16, -95.0], 4)
            .on('zoomstart', zoomstart)
            .on('zoomend', zoomend);
    //// end Mapbox

    //// CloudMade
    // var map = L.map('steam-map', {
    //             'maxZoom': 12
    //         })
    //         .setView([39.16, -95.0], 4)
    //         .on('zoomstart', zoomstart)
    //         .on('zoomend', zoomend);

    // var cloudMadeBase = 'http://{s}.tile.cloudmade.com';
    // var cloudMadeAPI = '9e9c00943dfb4531a9769893c92b78c4';
    // var cloudMadeStyleId = '121934';
    // var retina_prefix = L.Browser.retina ? '@2x' : '';
    // var cloudMadeTileSize = '256';

    // var tileUrl = cloudMadeBase + '/' +
    //               cloudMadeAPI + '/' +
    //               cloudMadeStyleId +
    //               retina_prefix + '/' +
    //               cloudMadeTileSize + '/' +
    //               '{z}/{x}/{y}.png';

    // L.tileLayer(tileUrl).addTo(map);
    //// end CloudMade

    // define max bounds
    // disables users ability to continually pan
    // east/west beyond the extent of where the data
    // actually resides
    var max_south_west = new L.LatLng(-90, -240),
        max_north_east = new L.LatLng(90, 240),
        max_bounds = new L.LatLngBounds(
            max_south_west,
            max_north_east);

    map.setMaxBounds(max_bounds);

    return map;
}