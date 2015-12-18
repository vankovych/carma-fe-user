'use strict';

var CM = {
    svgWidth: 1024,
    svgHeight: 900,
    R: 325,
    arcTween: function (transition, newAngle) {
        transition.attrTween("d", function (d) {
            var interpolate = d3.interpolate(d.initAngle, newAngle);

            return function (t) {
                d.initAngle = interpolate(t);
                return CM.arc(d);
            };
        });
    }
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

    $('#form-container').fadeOut();

    // process subs
    if (division.subdivisions) {

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
            var j = division.i < 11 ? division.i + i : division.i - i;
            moveArc(d3.select('#' + id)[0][0], CM.ArcLen * j);
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

        CM.group.selectAll('g.subdivision-title')
                .transition()
                .delay(300)
                .duration(750)
                .style('opacity', '1');

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
                .attr('y', -CM.R)
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
                positions = CM.data.positions.filter(function (p) {
                    return div.positions.indexOf(p.id) >= 0;
                });
            }

            CM.group.selectAll('g#' + div.id + '-position-tree')
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

        CM.group.selectAll('g.position-tree')
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

    console.log(currentId);

    renderTransition(currentId, 'p12');
}

function renderTransition(currentId, targetId) {
    var current = d3.select('#' + currentId),
            target = d3.select('#' + targetId);

    var c = current[0][0].getBoundingClientRect(),
            t = target[0][0].getBoundingClientRect();

    d3.selectAll('svg>g').append('line')
            .style('stroke', 'gray')
            .attr("x1", Math.round(c.x) - CM.svgWidth / 2 - 105 - c.width / 2)
            .attr("y1", Math.round(c.y) - CM.svgHeight / 2 + c.height / 2)
            .attr("x2", Math.round(t.x) - CM.svgWidth / 2 - 105 - t.width / 2)
            .attr("y2", Math.round(t.y) - CM.svgHeight / 2 + t.height / 2);
}