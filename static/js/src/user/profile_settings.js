module.exports = function ProfileSettings () {
    var self = {},
        selection;

    self.selection = function (x) {
        if (!arguments.length) return selection;
        selection = x;
        return self;
    };

    return self;
};