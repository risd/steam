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
                    type: 'individual'
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
                    type: 'institution'
                };
            }

            return current;
        };

        for (var i = 0; i < args.education; i++) {
            network_data.steamies.push(fake_data('education'));
        }
        for (var i = 0; i < args.research; i++) {
            network_data.steamies.push(fake_data('research'));
        }
        for (var i = 0; i < args.political; i++) {
            network_data.steamies.push(fake_data('political'));
        }
        for (var i = 0; i < args.industry; i++) {
            network_data.steamies.push(fake_data('industry'));
        }

        return network_data;
    }
};