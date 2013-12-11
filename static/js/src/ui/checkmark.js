module.exports = function addCheckmarks () {
    var size = 30,
        stroke = 'white',
        stroke_width = 1;

    function add (sel) {
        var svg = sel.append('svg')
            .attr('width', size)
            .attr('height', size)
            .attr('class', 'checkmark')
            .selectAll('line')
            .data([
                { x1: 0, y1: size/2,
                  x2: size/2, y2: size },
                { x1: size/2, y1: size,
                  x2: size, y2: 0 }
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
                .attr('stroke-width', stroke_width)
                .attr('stroke', stroke);
    }

    add.stroke = function (x) {
        if (!arguments.length) return stroke;
        stroke = x;
        return add;
    };

    add.stroke_width = function (x) {
        if (!arguments.length) return stroke_width;
        stroke_width = x;
        return add;
    };

    add.size = function (x) {
        if (!arguments.length) return size;
        size = x;
        return add;
    };

    return add;
};