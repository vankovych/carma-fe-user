'use strict';

var CM = {
    svgWidth: 1000,
    svgHeight: 900,
    R: 300,
    arcTween: function (transition, newAngleS) {
        transition.attrTween("d", function (d) {

            var interpolateS = d3.interpolate(d.startAngle, newAngleS),
                    interpolateE = d3.interpolate(d.endAngle, newAngleS + CM.ArcLen - CM.ArcMargin);

            return function (t) {
                d.startAngle = interpolateS(t);
                d.endAngle = interpolateE(t);

                return CM.arc(d);
            };
        });
    }
};

CM.P = Math.PI * 2;
CM.ArcLen = CM.P / 24;
CM.ArcMargin = CM.P / 400;

// Arc function
CM.arc = d3.svg.arc()
        .startAngle(function (d) {
            return d.startAngle;
        })
        .endAngle(function (d) {
            return d.startAngle + CM.ArcLen - CM.ArcMargin;
        })
        .innerRadius(CM.R - 10)
        .outerRadius(CM.R + 7);