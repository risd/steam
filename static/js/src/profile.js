var Individual = require('./profile_individual'),
    Institution = require('./profile_institution');

module.exports = function Profile (context) {
    var self = {},
        geo_options,
        profile,
        type,
        built = false;

    self.built = function (x) {
        // tell the world whether or not
        // this jam has been built
        if (!arguments.length) return built;
        built = x;
        return self;
    };

    self.geoOptions = function (x) {
        if (!arguments.length) return geo_options;
        geo_options = x;
        return self;
    };

    self.build = function () {
        type = context.user.type();

        if ( type === 'individual') {
            profile = Individual(context)
                .selection(d3.select('#profile-individual'))
                .geoOptions(geo_options)
                .data(context.user.data())
                .build();

        } else if (type === 'institution') {
            profile = Individual(context)
                .selection(d3.select('#profile-institution'))
                .geoOptions(geo_options)
                .data(context.user.data())
                .build();
        }

        self.built(true);

        return self;
    };

    return self;
};