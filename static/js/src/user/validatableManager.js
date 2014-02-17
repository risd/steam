module.exports = function ValidatableComponentManager () {
    var self = {},
        validatable = [],
        validated = [];

    self.add = function (x) {
        // add objects that include links to functions
        // and arrays that describe the component,
        // and its relationship to the data structu
        // it comes from
        // {
        //     isValid: function
        // }
        validatable.push(x);
        return self;
    };

    self.batchAdd = function (x) {
        x.forEach(function (n, i) {
            validatable.push(n);
        });
        return self;
    };

    self.all = function () {
        return validatable;
    };

    self.check = function () {
        validated = [];
        validatable.forEach(function (n, i) {
            if (n.isValid()) {
                console.log('n');
                console.log(n);
                validated.push(n);
            }
        });
        return self;
    };

    self.validated = function () {
        return validated;
    };

    self.areValid = function () {
        self.check();
        if (self.validated().length === self.all().length) {
            return true;
        }
        return false;
    };

    return self;
};