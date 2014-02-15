module.exports = ClusterIconSize;

// Defines cluster sizes, for both
// selected and unselsected states
function ClusterIconSize () {
    var size = {
        inner_diameter: {
            two_digit: 36,
            three_digit: 42,
            four_digit: 50,
            five_digit: 54,
            six_digit: 61
        },
        // gap between inner icon and arc
        // based on arc.status
        gap_width: {
            unselected: 4,
            default: 2,
            selected: 1
        },
        // width of the arc
        arc_width: {
            unselected: 1,
            default: 4,
            selected: 10
        }
    };

    (function set_size (size) {
        for (var key in size.inner_diameter) {
            size[key] = {
                total: size.inner_diameter[key] +
                       ((size.gap_width.selected +
                         size.arc_width.selected) * 2),
                unselected: {
                    innerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.unselected)),
                    outerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.unselected) +
                                  (size.arc_width.unselected))
                },
                default: {
                    innerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.default)),
                    outerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.default) +
                                  (size.arc_width.default))
                },
                selected: {
                    innerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.selected)),
                    outerRadius: ((size.inner_diameter[key] / 2) +
                                  (size.gap_width.selected) +
                                  (size.arc_width.selected))
                }
            };
        }
    })(size);

    return size;
}