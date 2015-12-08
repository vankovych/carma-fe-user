'use strict';

var CM = {
    svgWidth: 1000,
    svgHeight: 900,
    R: 300,
    arcTween: function (transition, newAngle) {
        transition.attrTween("d", function (d) {
            var interpolate = d3.interpolate(d.startAngle, newAngle);

            return function (t) {
                d.startAngle = interpolate(t);
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

// Bezier curve function
CM.line = d3.svg.line.radial()
        .interpolate('bundle')
        .tension(.85)
        .radius(function (d) {
            return d.y;
        })
        .angle(function (d) {
            return d.x / 180 * Math.PI;
        });

function moveArc(arc, angle) {

    angle = angle || (0.73 * CM.P);

    d3.select(arc)
            .transition()
            .duration(750)
            .call(CM.arcTween, angle);
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

    var subdivisions = [];

    hideDivisions(division.id);

    // process subs
    if (division.subdivisions) {

        // get subs for selected division
        subdivisions = CM.subdivisions.filter(function (s) {
            return division.subdivisions.indexOf(s.id) >= 0;
        });

        subdivisions.forEach(function (subdivision, i) {
//            subdivision.i = i + 1;
            subdivision.startAngle = division.startAngle;
            subdivision.expandAngle = CM.ArcLen * (i + division.i);
        });

        // render subs
        CM.group.selectAll('path.subdivision')
                .data(subdivisions).enter()
                // arc
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
//        renderTitles(subdivisions, 'subdivision-title', 0);
        CM.group.selectAll('g.subdivision-title')
                .data(subdivisions).enter()
                // title group
                .append('g')
                .attr('class', 'subdivision-title')
                .style('opacity', 0)
                .attr('transform', function (d) {
                    return 'rotate(' + ((d.expandAngle + CM.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
                })
                // title text
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

    // render position trees
    var range = division.subdivisions ? subdivisions : new Array(division);

    CM.group.selectAll('g.position-tree')
            .data(range).enter()
            // tree group
            .append('g')
            .attr('class', 'position-tree')
            .attr('id', function (d) {
                return d.id + '-position-tree';
            })
            .attr('transform', function (d, i) {
                return 'rotate(' + ((i + division.i) * 15 + 7) + ')';
            })
            .style('opacity', 0)
            // tree trunk
            .append('rect')
            .attr('class', 'trunk')
            .attr('x', -2)
            .attr('y', -290)
            .attr('width', 2)
            .attr('height', function (d) {
                return d.positions ? d.positions.length * 27 : 0;
            })
            .attr('fill', function (d, i) {
                return CM.color(division.i);
            });

    range.forEach(function (div) {

        var positions = [];
        if (div.positions) {
            positions = CM.positions.filter(function (p) {
                return div.positions.indexOf(p.id) >= 0;
            });
        }

        CM.group.selectAll('g#' + div.id + '-position-tree')
                .selectAll('circle.position')
                .data(positions).enter()
                // position leaf
                .append('circle')
                .attr('class', 'position')
                .attr('cx', function (d) {
                    return -1;
                })
                .attr('cy', function (d, i) {
                    return -CM.R + 30 * ++i;
                })
                .attr('r', 7)
                .style('fill', function (d, i) {
                    return CM.color(division.i);
                })
                // tooltip with position title
                .append('title')
                .text(function (d) {
                    return d.title;
                });
    });

    CM.group.selectAll('g.position-tree')
            .transition()
            .delay(function () {
                return range.length > 1 ? 300 : 300;
            })
            .duration(function () {
                return range.length > 1 ? 750 : 750;
            })
            .style('opacity', '1');

}

function collapseDivision(division) {

    showDivisions(division.id);

    if (division.subdivisions) {

        CM.group.selectAll('g#' + division.id + '-title>text')
                .transition()
                .duration(750)
                .style('fill', '#494949')
                .attr('dy', '.31em');

        division.subdivisions.forEach(function (id) {
            moveArc(d3.select('#' + id)[0][0], CM.ArcLen * division.i);
        });

        // remove subdivisions
        CM.group.selectAll('.subdivision')
                .transition()
                .delay(700)
                .duration(500)
                .style('opacity', '0')
                .remove();

        // remove subdivision titles
        CM.group.selectAll('g.subdivision-title')
                .transition()
                .duration(750)
                .style('opacity', '0')
                .remove();

    }

    CM.group.selectAll('.position-tree')
            .transition()
            .duration(500)
            .style('opacity', '0')
            .remove();
}

function renderTitles(data, className, opacity) {
    CM.group.selectAll('g.' + className)
            .data(data).enter()
            .append('g')
            .attr('class', className)
            .attr('id', function (d) {
                return d.id + '-title';
            })
            .attr('transform', function (d) {
                return 'rotate(' + ((d.startAngle + CM.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
            })
            .style('opacity', opacity)
            .append('text')
            .attr('dx', function (d) {
                return d.startAngle.toDeg() < 180 ? 15 : -15;
            })
            .attr('dy', '.31em')
            .attr('text-anchor', function (d) {
                return d.startAngle.toDeg() < 180 ? 'start' : 'end';
            })
            .attr('transform', function (d) {
                return d.startAngle.toDeg() < 180 ? null : 'rotate(180)';
            })
            .text(function (d) {
                return d.title;
            })
            .on('click', function (d) {
                collapseDivision(d);
            });
}

window.onload = function () {

    d3.select('#d15').on('click', function () {
        var
                lineData = [
                    [
                        {'x': -CM.R + 30, 'y': 30},
                        {'x': -CM.R / 2, 'y': -100},
                        {'x': CM.R - 100, 'y': -10},
                        {'x': CM.R - 50, 'y': -110}
                    ],
                    [
                        {'x': -CM.R + 30, 'y': 30},
                        {'x': -CM.R / 2, 'y': -100},
                        {'x': CM.R - 100, 'y': -10},
                        {'x': CM.R - 80, 'y': -100}
                    ],
                    [
                        {'x': -CM.R + 30, 'y': 30},
                        {'x': -CM.R / 2, 'y': -100},
                        {'x': CM.R - 100, 'y': 10},
                        {'x': CM.R - 30, 'y': -40}
                    ]
                ];

        var lineFunction = d3.svg.line()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .interpolate('basis');

        CM.group.selectAll('path.spline')
                .data(lineData).enter()
                .append('path')
                .attr('d', function (d) {
                    return lineFunction(d);
                })
                .attr('stroke', CM.color(4))
                .attr('stroke-width', 1)
                .attr('fill', 'none');
    });
};

Number.prototype.toDeg = function () {
    return this * (180 / Math.PI);
};