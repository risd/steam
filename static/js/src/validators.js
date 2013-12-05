var Q = require('q'),
    LGTM = require('lgtm');

LGTM.configure('defer', Q.defer);

module.exports = Validators;

function Validators () {
    var validators = {};

    var regex = {
        email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    };
    

    validators.individual = LGTM.validator()
        .validates('first_name')
            .using(function (value, attr, object) {
                if (object.individual.first_name) {
                    return true;
                }
                return false;
            }, 'You must enter a first name')
        .validates('last_name')
            .using(function (value, attr, object) {
                if (object.individual.last_name) {
                    return true;
                }
                return false;
            }, 'You must enter a last name')
        .validates('email')
            .using(function (value, attr, object) {
                if (object.individual.email
                        .match(regex.email)) {
                    return true;
                }
                return false;
            }, 'You must enter an email')
        .validates('zip_code')
            .required('You must eneter a zip code')
        .build();

    validators.institution = LGTM.validator()
        .validates('name')
            .required('You must enter a name')
        .build();

    return validators;
}