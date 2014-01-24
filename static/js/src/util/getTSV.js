module.exports = function dataTSV (url) {
    var self = {},
        data;

    self.dispatch = d3.dispatch('loaded');

    self.data = function (x) {
        if (!arguments.length) return data;
        data = x;
        return self;
    };

    function get () {
        d3.tsv(url, function (err, response) {
            self.data(response);
            self.dispatch.loaded.apply(this, arguments);
        });
    }

    // initialize
    get();

    return self;
};