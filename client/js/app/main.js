'use strict';

var CM = {
    svgWidth: 1000,
    svgHeight: 900,
    R: 300,
    arcTween: function (transition, newAngle) {
        transition.attrTween("d", function (d) {

            var interpolateS = d3.interpolate(d.startAngle, newAngle),
                    interpolateE = d3.interpolate(d.endAngle, newAngle + CM.ArcLen - CM.ArcMargin);

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

function moveArc(arc, angle) {

    angle = angle || (0.73 * CM.P);

    d3.select(arc)
            .transition()
            .duration(750)
            .call(CM.arcTween, angle);

//                var gr = d3.select('g#d1-title')
//                        .attr('transform', function (d) {
//                            return 'rotate(' + (ang - 90) + ')translate(' + 300 + ')';
//                        })
//                        .select('text')
//                        .attr('dx', function (d) {
//                            return ang < 180 ? 15 : -15;
//                        })
//                        .attr('text-anchor', function (d) {
//                            return ang < 180 ? 'start' : 'end';
//                        })
//                        .attr('transform', function (d) {
//                            return ang < 180 ? null : 'rotate(180)';
//                        });

}

function hideDivisions(exceptId) {

    // fade in all divisions except for selected
    CM.group.selectAll('.division')
            .transition()
            .duration(300)
            .style('opacity', function () {
                return (this.id === exceptId) ? .8 : .2;
            });

    // fade in selected division title             
    CM.group.selectAll('g.division-title')
            .transition()
            .duration(750)
            .style('opacity', function () {
                return (this.id === exceptId + '-title') ? 1 : 0;
            });
}

function showDivisions() {

    // fade out all divisions
    CM.group.selectAll('.division')
            .transition()
            .delay(300)
            .duration(300)
            .style('opacity', '1');

    // fade out division title             
    CM.group.selectAll('g.division-title')
            .transition()
            .delay(500)
            .duration(300)
            .style('opacity', '1');
}

function expandDivision(division) {

    if (division.subdivisions) {

        hideDivisions(division.id);

        var subdivisions = CM.subdivisions.filter(function (s) {
            return division.subdivisions.indexOf(s.id) >= 0;
        });

        subdivisions.forEach(function (subdivision, i) {
            subdivision.i = i + 1;
            subdivision.startAngle = division.startAngle;
            subdivision.expandAngle = CM.ArcLen * (i + division.i);
        });

        // render subdivisions
        CM.group.selectAll('path.subdivision')
                .data(subdivisions).enter()
                .append('path')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('d', CM.arc)
                .attr('cx', 100)
                .attr('class', 'subdivision')
                .attr('fill', function () {
                    return CM.color(division.i);
                });

        CM.group.selectAll('g#' + division.id + '-title>text')
                .transition()
                .duration(750)
                .style('fill', CM.color(division.i))
                .attr('dy', '-2em');

        division.subdivisions.forEach(function (id, i) {
            moveArc(d3.select('#' + id)[0][0], CM.ArcLen * (i + division.i));
        });

        // render subdivision titles
        CM.group.selectAll('g.subdivision-title')
                .data(subdivisions).enter()
                .append('g')
                .attr('class', 'subdivision-title')
                .style('opacity', 0)
                .attr('transform', function (d) {
                    return "rotate(" + ((d.expandAngle + CM.ArcLen / 2).toDeg() - 90) + ")translate(" + 300 + ')';
                })
                .append('text')
                .attr('dx', function (d) {
                    return d.expandAngle.toDeg() < 180 ? 15 : -15;
                })
                .attr('dy', '.31em')
                .attr('text-anchor', function (d) {
                    return d.expandAngle.toDeg() < 180 ? 'start' : 'end';
                })
                .attr('transform', function (d) {
                    return d.expandAngle.toDeg() < 180 ? null : 'rotate(180)';
                })
                .text(function (d) {
                    return d.title;
                });

        CM.group.selectAll('g.subdivision-title')
                .transition()
                .delay(300)
                .duration(750)
                .style('opacity', '1');
    }
}

function collapseDivision(division) {

    showDivisions(division.id);

    CM.group.selectAll('g#' + division.id + '-title>text')
            .transition()
            .duration(750)
            .style('fill', '#494949')
            .attr('dy', '.31em');

    division.subdivisions.forEach(function (id) {
        moveArc(d3.select('#' + id)[0][0], CM.ArcLen * division.i);
    });

    // render division titles
    CM.group.selectAll('.subdivision')
            .transition()
            .delay(700)
            .duration(500)
            .style('opacity', '0')
            .remove();

    // render division titles
    CM.group.selectAll('g.subdivision-title')
            .transition()
            .duration(750)
            .style('opacity', '0')
            .remove();
}

window.onload = function runD3code() {
    //d3.select('#d4').on('click', expandDivision);
//    d3.select('#d4-title').on('click', collapseDivision);
};

Number.prototype.toDeg = function () {
    return this * (180 / Math.PI);
};