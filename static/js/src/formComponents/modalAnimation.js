module.exports = function flowAnimation () {
    var self = {},
        selection,
        force,
        data,
        canvas_sel,
        nodes_sel,
        initial = 10,
        node_count,
        rendered = false;

    self.selection = function (x) {
        if(!arguments.length) return selection;
        selection = x;
        return self;
    };

    self.addHighlight = function (x, y) {
        add_highlight(x, y);
        return self;
    };

    self.remove = function () {
        if (rendered) {
            force.stop();
            selection.html('');
        }
        selection.style('display', 'none');
        rendered = false;
        return self;
    };

    self.render = function () {
        selection.style('display', 'block');
        if (rendered) {
            force.alpha(10);
            return;
        }
        var random = d3.random.normal(0, 15);

        var height = window.innerHeight,
            width = window.innerWidth;

        data = d3.range(initial).map(function (i) {
            var d = {
                id: i,
                x: random() + (width/2),
                y: random() + (height/2),
                r: 8,
                highlight: false
            };
            d.dx = d.x;
            d.dy = d.y;

            return d;
        });

        force = d3.layout.force()
            .gravity(0.1)
            .friction(0.9)
            .charge(-30)
            .size([width, height])
            .links([])
            .nodes(data)
            .on('tick', tick);

        canvas_sel = selection
            .append('svg')
            .attr('height', height)
            .attr('width', width)
            .append('g');

        nodes_sel = canvas_sel.selectAll('.movement');

        start();
        rendered = true;
    };

    function add_highlight (x, y) {
        var prev_highlight;
        if ((data.length - 1) >= (initial)) {
            prev_highlight = data.pop();
        }

        data.push({
            id: (prev_highlight ? prev_highlight.id : data.length),
            x: x,
            y: y,
            dx: x,
            dy: y,
            r: 10,
            highlight: true
        });
        start();
    }

    function start() {
        nodes_sel = nodes_sel
            .data(force.nodes(), function (d) { return d.id; });

        nodes_sel
            .enter()
            .append('circle')
            .attr('class', function (d) {
                return 'movement ' + (d.highlight ? 'highlight' : '');
            })
            .attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; })
            .attr('r', function (d) { return d.r; });

        nodes_sel
            .exit()
            .transition()
            .duration(800)
            .attr('r', 0)
            .remove();

        force.start();
    }

    function tick () {
        nodes_sel.attr('cx', function (d) { return d.x; })
            .attr('cy', function (d) { return d.y; });
    }

    return self;
};