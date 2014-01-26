var filters = [{
        value: 'research',
        display: 'research',
        active: 1
    }, {
        value: 'education',
        display: 'education',
        active: 1
    }, {
        value: 'political',
        display: 'political',
        active: 1
    }, {
        value: 'industry',
        display: 'industry',
        active: 1
    }];

if (typeof module !== 'undefined') {
    exports = module.exports = filters;
} else {
    window.filters = filters;
}