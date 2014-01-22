module.exports = function UpdatableComponentManager () {
    var self = {},
        updatable = [],
        updated = [];

    self.add = function (x) {
        updatable.push(x);
        return self;
    };

    self.batchAdd = function (x) {
        x.forEach(function (n, i) {
            updatable.push(x);
        });
        return self;
    };

    self.all = function () {
        return updatable;
    };

    self.check = function () {
        updated = [];
        updatable.forEach(function (n, i) {
            if (n.isDifferent()) {
                updated.push(n);
            }
        });
        return self;
    };

    self.updated = function () {
        return updated;
    };

    self.resetInitialValues = function () {
        updated.forEach(function (n, i) {
            n.reset_initial(n.value());
        });
    };

    return self;
};