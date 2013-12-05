var filters = [{
        abbr: 'res',
        display: 'research',
        active: 1
    }, {
        abbr: 'edu',
        display: 'education',
        active: 1
    }, {
        abbr: 'pol',
        display: 'political',
        active: 1
    }, {
        abbr: 'ind',
        display: 'industry',
        active: 1
    }];

if (typeof module !== 'undefined') {
    exports = module.exports = filters;
} else {
    window.filters = filters;
}