module.exports = function flowAnimation () {
    var self = {},
        selection,
        force,
        rendered = false;

    self.selection = function (x) {
        if(!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.render = function () {
        if (rendered) {
            force.alpha(10);
            return;
        }
        rendered = true;
        console.log('rendering');
        console.log(selection);
        var random = d3.random.normal(0, 15);

        var data = d3.range(10).map(function () {
            var d = {
                x: random(),
                y: random(),
                r: 10
            };
            d.dx = d.x;
            d.dy = d.y;

            return d;
        });

        console.log(data);

        var height = window.innerHeight,
            width = window.innerWidth;

        force = d3.layout.force()
            .gravity(0.1)
            .friction(0.9)
            .charge(-30)
            .size([width/2, height/2])
            .links([])
            .nodes(data)
            .start();

        var canvas_sel = selection
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .append('g')
            .attr('transform',
                  'translate(' + width/2 + ',' +
                                 height/2 +')');

        var nodes = canvas_sel.selectAll('.movement')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'movement')
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', function (d) { return d.r; });

        force.on('tick', function () {
            nodes.attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; });
        });
    };

    return self;
};