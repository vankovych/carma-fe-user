'use strict';

var CM = {
    svgWidth: 1024,
    svgHeight: 900,
    R: 325,
    mode: 1, // 1 - Build my career, 2 - Browse positions
    arcTween: function (transition, newAngle) {
        transition.attrTween("d", function (d) {
            var interpolate = d3.interpolate(d.initAngle, newAngle);

            return function (t) {
                d.initAngle = interpolate(t);
                return CM.arc(d);
            };
        });
    },
    duration: 750
};

CM.P = Math.PI * 2;
CM.ArcLen = CM.P / 24;
CM.ArcMargin = CM.P / 400;

// Draw arc function
CM.arc = d3.svg.arc()
        .startAngle(function (d) {
            return d.initAngle;
        })
        .endAngle(function (d) {
            return d.initAngle + CM.ArcLen - CM.ArcMargin;
        })
        .innerRadius(CM.R)
        .outerRadius(CM.R + 20);

// Draw arc function
CM.arc1 = d3.svg.arc()
        .startAngle(function (d) {
            return d.initAngle - CM.ArcLen;// + CM.ArcMargin;
        })
        .endAngle(function (d) {
            return d.initAngle + CM.ArcLen - CM.ArcMargin;
        })
        .innerRadius(CM.R)
        .outerRadius(CM.R + 3);

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

/**
 * 
 * @param {type} arc
 * @param {type} angle
 * @returns {undefined}
 */
function moveArc(arc, angle) {
    angle = angle || (0.73 * CM.P);

    d3.select(arc)
            .transition()
            .duration(750)
            .call(CM.arcTween, angle);
}

/**
 * 
 * @param {type} exceptId
 * @returns {undefined}
 */
function hideDivisions(exceptId) {

    // fade in all divisions except for selected
    CM.group.selectAll('.division')
            .transition()
            .duration(300)
            .style('opacity', function () {
                return (this.id === exceptId) ? 1 : .2;
            });

    // fade in selected division title             
    CM.group.selectAll('g.division-title')
            .transition()
            .duration(750)
            .style('opacity', function () {
                return (this.id === exceptId + '-title') ? 1 : 0;
            });
}

/**
 * 
 * @returns {undefined}
 */
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

/**
 * 
 * @param {type} division
 * @returns {undefined}
 */
function expandDivision(division) {

    if (division.subdivisions) {

        $('#form-container').fadeOut();

        // process subs

        var subdivisions = [];

        hideDivisions(division.id);

        // get subs for selected division
        subdivisions = CM.data.subdivisions.filter(function (s) {
            return division.subdivisions.indexOf(s.id) >= 0;
        });

        subdivisions.forEach(function (subdivision, i) {
            var j = division.i < 11 ? division.i + i : division.i - i;
            subdivision.initAngle = division.initAngle;
            subdivision.expandAngle = CM.ArcLen * j;
        });

        // render subs
        CM.group.selectAll('path.' + division.id + '-subdivision')
                .data(subdivisions).enter()
                // arc
                .append('path')
                .attr('class', division.id + '-subdivision subdivision')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('d', CM.arc)
                .attr('cx', 100)
                .attr('fill', function () {
                    return CM.color(division.i);
                });

        // move division title up
        CM.group.selectAll('g#' + division.id + '-title>text')
                .transition()
                .duration(750)
                .style('fill', CM.color(division.i))
                .attr('dy', '-2em');

        // move subdivisions
        division.subdivisions.forEach(function (id, i) {
            var j = division.i < 11 ? division.i + i : division.i - i;
            moveArc(d3.select('#' + id)[0][0], CM.ArcLen * j);
        });

        // render subdivision titles
//        renderTitles(subdivisions, 'subdivision-title', 0);
        CM.group.selectAll('g.' + division.id + '-subdivision-title')
                .data(subdivisions).enter()
                // title group
                .append('g')
                .attr('class', division.id + '-subdivision-title subdivision-title')
                .style('opacity', 0)
                .attr('transform', function (d) {
                    return 'rotate(' + ((d.expandAngle + CM.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
                })
                // title text
                .append('text')
                .attr('dx', function (d) {
                    return d.expandAngle.toDeg() < 180 ? 50 : -50;
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

        CM.group.selectAll('g.' + division.id + '-subdivision-title')
                .transition()
                .delay(300)
                .duration(750)
                .style('opacity', '1');

        // render position trees
        CM.group.selectAll('g.' + division.id + '-position-tree')
                .data(subdivisions).enter()
                // tree group
                .append('g')
                .attr('class', division.id + '-position-tree position-tree')
                .attr('id', function (d) {
                    return d.id + '-position-tree';
                })
                .attr('transform', function (d, i) {
                    return 'rotate(' + (((division.i < 12 ? i : -i) + division.i) * 15 + 7) + ')';
                })
                .style('opacity', 0)
                // tree trunk
                .append('rect')
                .attr('class', 'trunk')
                .attr('x', -2)
                .attr('y', -CM.R)
                .attr('width', 2)
                .attr('height', function (d) {
                    return d.positions ? d.positions.length * 27 : 0;
                })
                .attr('fill', function (d, i) {
                    return CM.color(division.i);
                });

        subdivisions.forEach(function (sub) {
            var positions = [];
            if (sub.positions) {
                positions = CM.data.positions.filter(function (p) {
                    return sub.positions.indexOf(p.id) >= 0;
                });
            }

            CM.group.selectAll('g#' + sub.id + '-position-tree')
                    .selectAll('circle.position')
                    .data(positions).enter()
                    // position leaf
                    .append('circle')
                    .attr('id', function (d) {
                        return d.id;
                    })
                    .attr('class', 'position')
                    .attr('cx', function (d) {
                        return -1;
                    })
                    .attr('cy', function (d, i) {
                        return -CM.R + 30 * i + 20;
                    })
                    .attr('r', 7)
                    .style('fill', function (d, i) {
                        return CM.color(division.i);
                    })
                    .on('click', function (d) {
                        selectPosition(d.id);
                    })
                    // tooltip with position title
                    .append('title')
                    .text(function (d) {
                        return d.title;
                    });
        });

        CM.group.selectAll('g.' + division.id + '-position-tree')
                .transition()
                .delay(300)
                .duration(750)
                .style('opacity', '1');
    }
}

/**
 * 
 * @param {type} division
 * @returns {undefined}
 */
function collapseDivision(division) {

    $('#form-container').fadeIn();

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

/**
 * 
 * @param {type} data
 * @param {type} className
 * @param {type} opacity
 * @returns {undefined}
 */
function renderTitles(data, className) {
    CM.group.selectAll('g.' + className)
            .data(data).enter()
            .append('g')
            .attr('class', className)
            .attr('id', function (d) {
                return d.id + '-title';
            })
            .attr('transform', function (d) {
                return 'rotate(' + ((d.finalAngle + CM.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
            })
            .style('opacity', 0)
            .append('text')
            .attr('dx', function (d) {
                return d.finalAngle.toDeg() < 180 ? 50 : -50;
            })
            .attr('dy', '.31em')
            .attr('text-anchor', function (d) {
                return d.finalAngle.toDeg() < 180 ? 'start' : 'end';
            })
            .attr('transform', function (d) {
                return d.finalAngle.toDeg() < 180 ? null : 'rotate(180)';
            })
            .text(function (d) {
                return d.title;
            })
            .on('click', function (d) {
                collapseDivision(d);
            });

//    CM.group.selectAll('g.' + className)
//            .transition()
//            .delay(750)
//            .duration(750)
//            .style('opacity', '1');
}

/**
 * 
 * @returns {undefined}
 */
function renderDivisions() {

    CM.group.selectAll('.division').remove();
    CM.group.selectAll('.subdivision').remove();
    CM.group.selectAll('.subdivision-title').remove();
    CM.group.selectAll('.position-tree').remove();

    // add additional data
    for (var i = 0, j = 1; i < CM.data.divisions.length; i++, j++) {
        if (j === 11) {
            j += 2;
        }
        CM.data.divisions[i].initAngle = 0;
        CM.data.divisions[i].finalAngle = CM.ArcLen * j;
    }

    CM.group.selectAll('g.division-title')
            .transition()
            .style('opacity', '0');

    // render divisions
    CM.group.selectAll('path.division')
            .data(CM.data.divisions).enter()
            // arc
            .append('path')
            .attr('id', function (d) {
                return d.id;
            })
            .attr('d', CM.arc)
            .attr('cx', 100)
            .attr('class', 'division')
            .attr('fill', function (d, i) {
                return CM.color(d.i);
            })
            .on('click', function (d) {
                expandDivision(d);
            });

    CM.data.divisions.forEach(function (division, i) {
        moveArc(d3.select('#' + division.id)[0][0], division.finalAngle);
    });

    CM.group.selectAll('g.division-title')
            .transition()
            .delay(750)
            .duration(750)
            .style('opacity', '1');

    var dc = [{
            i: 0,
            initAngle: 0
        },
        {
            i: 12,
            initAngle: CM.ArcLen * 12
        }];

    // render divisions
    CM.group.selectAll('path.dc')
            .data(dc).enter()
            // arc
            .append('path')
//            .attr('class', '')
//            .attr('id', function (d) {
//                return d.id;
//            })
            .attr('d', CM.arc1)
            .attr('cx', 100)
            .attr('class', 'division')
            .attr('fill', '#ccc');

}

function selectPosition(currentId) {

    // show requirements


    // show transitions

    if (CM.mode === 1) {
        console.log(currentId);

//        renderTransition(currentId, 'p11');

//    $('#' + currentId).addClass('active');
    }
}

function renderTransition(currentId, targetId) {

    var c = d3.select('#' + currentId)[0][0].getBoundingClientRect(),
            t = d3.select('#' + targetId)[0][0].getBoundingClientRect(),
            x1 = Math.round(c.x) - CM.svgWidth / 2 - 105 - c.width / 2,
            y1 = Math.round(c.y) - CM.svgHeight / 2 + c.height / 2,
            x2 = Math.round(t.x) - CM.svgWidth / 2 - 105 - t.width / 2,
            y2 = Math.round(t.y) - CM.svgHeight / 2 + t.height / 2;

//    d3.selectAll('svg>g').append('line')
//            .style('stroke', CM.color(18))
//            .attr({
//                x1: x1,
//                y1: y1,
//                x2: x1,
//                y2: y1
//            })
//            .transition()
//            .duration(CM.duration)
//            .attr({
//                x2: x2,
//                y2: y2
//            });

    var
            lineData = [
                [
                    {'x': x1, 'y': y1},
                    {'x': x1 + CM.R / 2, 'y': y1 - CM.R / 2},
                    {'x': x2, 'y': y2}
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
}

function renderTransitions(position) {

//    var position = CM.data.positions.filter(function (p) {
//        return p.id === division.id;
//    });

    position.transition.forEach(function (tId) {
        renderTransition(position.id, tId);
    });
}