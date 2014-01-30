module.exports = function svgCross (sel) {
    console.log('cross');
    console.log(sel);
    var button_size = 45;

    // add the closing x as svg
    sel.append('svg')
        .attr('width', button_size)
        .attr('height', button_size)
        .selectAll('line')
        .data([
            { x1: 0, y1: 0,
              x2: button_size, y2: button_size },
            { x1: button_size, y1: 0,
              x2: 0, y2: button_size }
        ])
        .enter()
        .append('line')
            .attr('x1', function (d) {
                return d.x1;
            })
            .attr('y1', function (d) {
                return d.y1;
            })
            .attr('x2', function (d) {
                return d.x2;
            })
            .attr('y2', function (d) {
                return d.y2;
            })
            .attr('stroke-width', 1);
};