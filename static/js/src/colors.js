var colors = {
    research: 'rgb(105,230,64)',
    political: 'rgb(255,97,127)',
    education: 'rgb(255,137,49)',
    industry: 'rgb(39,180,242)'
};

if (typeof module !== 'undefined') {
    exports = module.exports = colors;
} else {
    window.colors = colors;
}