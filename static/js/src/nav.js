var Nav = function () {
    // blanket is the element that should appear
    //         when the mobile toggle is enabled
    //         and should close the mobile nav 
    //         when its touched
    // blanket class is the name of the class
    //         that enables the blanket
    // container el is the element that the mobile
    //         hidden class gets applied to
    // enable mobile el is the element that shows
    //         the mobile nav
    // mobile hidden class is the class that is
    //         applied to the nav in the mobile
    //         range that hides the nav.
    // scroll_distance hide mobile is the distance
    //         down the page one would have to scroll
    //         in order for the mobile nav to be engaged.
    var nav = {},
        blanket_el,
        blanket_class,
        container_el,
        toggle_mobile_el,
        mobile_hidden_class,
        scroll_distance_hide_mobile;

    nav.blanket = function (x) {
        if (!arguments.length) return blanket_el;
        blanket_el = x;
        return nav;
    };

    nav.blanketClass = function (x) {
        if (!arguments.length) return blanket_class;
        blanket_class = x;
        return nav;
    };

    nav.container = function (x) {
        if (!arguments.length) return container_el;
        container_el = x;
        return nav;
    };

    nav.mobileHiddenClass = function (x) {
        if (!arguments.length) return mobile_hidden_class;
        mobile_hidden_class = x;
        return nav;
    };

    nav.toggleMobile = function (x) {
        if (!arguments.length) return toggle_mobile_el;
        toggle_mobile_el = x;
        return nav;
    };

    nav.scrollDistanceHideMobile = function (x) {
        if (!arguments.length) return scroll_distance_hide_mobile;
        scroll_distance_hide_mobile = x;
        return nav;
    };

    nav.setup = function () {
        toggle_mobile_el
            .on('click.toggleMobile', function () {
                if (container_el.classed(mobile_hidden_class)) {
                    // show the mobile nav
                    container_el.classed(mobile_hidden_class, false);
                    blanket_el.classed(blanket_class, true);
                } else {
                    // hide the mobile nav
                    container_el.classed(mobile_hidden_class, true);
                    blanket_el.classed(blanket_class, false);
                }
                
            });

        d3.select(window)
            .on('scroll.mobileNav', function () {
                if (pageYOffset > scroll_distance_hide_mobile) {
                    container_el.classed(mobile_hidden_class, true);
                } else {
                    container_el.classed(mobile_hidden_class, false);
                }
            });

        blanket_el
            .on('click.hideMobile', function () {
                container_el.classed(mobile_hidden_class, true);
                blanket_el.classed(blanket_class, false);
            });
    };

    return nav;
};

module.exports = Nav;