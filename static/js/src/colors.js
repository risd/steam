var colors = {
    res: 'rgb(105,230,64)',
    pol: 'rgb(255,97,127)',
    edu: 'rgb(255,137,49)',
    ind: 'rgb(39,180,242)'
};

if (typeof module !== 'undefined') {
    exports = module.exports = colors;
} else {
    window.colors = colors;
}