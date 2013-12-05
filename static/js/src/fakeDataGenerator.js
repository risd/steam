var Faker = require('Faker');

module.exports = {
    network: function (args) {
        // pass in geojson properties, return
        // fake data for the network graph

        var network_data = {
            country: args.uid,
            steamies: []
        };

        var fake_data = function (work_in) {
            // return fake network data
            // only data that is passed in
            // is the segement the point
            // represents ()
            // 4/5 will be individuals

            var current;
            
            if (Math.random() < 0.8) {
                // i, individuals
                current = {
                    first_name: Faker.Name.firstName(),
                    last_name: Faker.Name.lastName(),
                    email: Faker.Internet.email(),
                    url: 'name@domain.com',
                    title: 'Engineer',
                    engaged_as: '',
                    work_in: work_in,
                    description: '',
                    type: 'i'
                };
            } else {
                // g, institutions/groups
                current = {
                    name: Faker.Company.companyName(),
                    representative_first_name:
                        Faker.Name.firstName(),
                    representative_last_name:
                        Faker.Name.lastName(),
                    representative_email:
                        Faker.Internet.email(),
                    url: 'name@domain.com',
                    engaged_as: '',
                    work_in: work_in,
                    description: '',
                    type: 'g'
                };
            }

            return current;
        };

        for (var i = 0; i < args.edu; i++) {
            network_data.steamies.push(fake_data('edu'));
        }
        for (var i = 0; i < args.res; i++) {
            network_data.steamies.push(fake_data('res'));
        }
        for (var i = 0; i < args.pol; i++) {
            network_data.steamies.push(fake_data('pol'));
        }
        for (var i = 0; i < args.ind; i++) {
            network_data.steamies.push(fake_data('ind'));
        }

        return network_data;
    }
};