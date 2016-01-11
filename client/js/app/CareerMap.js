/* Career Map module */

'use strict';
define('app/CareerMap', [
    'd3',
    'jquery',
    'jqueryui'
], function (d3, $) {

    var CareerMap = function (json) {
        var root = this;

        this.data = json;
        this.svgWidth = 1024;
        this.svgHeight = 900;
        this.R = 325;
        this.mode = 1; // 1 - Build my career, 2 - Browse positions
        this.duration = 750;
        this.P = Math.PI * 2;
        this.ArcLen = root.P / 20;
        this.ArcMargin = root.P / 400;

        // create custom color scale from predifined colors
        this.color = d3.scale.ordinal()
                .domain(this.data.divisions.map(function (d) {
                    return d.i;
                }))
                .range(json.colors);

        this.arcTween = function (transition, newAngle) {
            transition.attrTween('d', function (d) {
                var interpolate = d3.interpolate(d.initAngle, newAngle);
                return function (t) {
                    d.initAngle = interpolate(t);
                    return root.arc(d);
                };
            });
        };

        // Draw arc function
        this.arc = d3.svg.arc()
                .startAngle(function (d) {
                    return d.initAngle;
                })
                .endAngle(function (d) {
                    return d.initAngle + root.ArcLen - root.ArcMargin;
                })
                .innerRadius(root.R)
                .outerRadius(root.R + 20);

        // Draw arc function
        this.arc1 = d3.svg.arc()
                .startAngle(function (d) {
                    return d.initAngle;
                })
                .endAngle(function (d) {
                    return d.initAngle + root.ArcLen - root.ArcMargin;
                })
                .innerRadius(root.R)
                .outerRadius(root.R + 5);

        this.init();

        this.renderTitles(this.data.divisions, 'division-title');
        this.renderDivisions(this.data.divisions);
    };

    CareerMap.prototype.init = function () {
        // add additional data
        for (var i = 0, j = 1; i < this.data.divisions.length; i++, j++) {
            this.data.divisions[i].i = i;
            this.data.divisions[i].initAngle = 0;
            this.data.divisions[i].finalAngle = this.ArcLen * i;
        }

        // create svg element
        this.svg = d3.select('#map svg')
                .attr('width', this.svgWidth)
                .attr('height', this.svgHeight);

        // create group element
        this.group = this.svg.append('g')
                .attr('width', this.svgWidth)
                .attr('height', this.svgHeight)
                .attr('transform', 'translate(' + this.svgWidth / 2 + ', ' + this.svgHeight / 2 + ')');
    };

    CareerMap.prototype.moveArc = function (arc, angle) {
        var root = this;
        // angle = angle || (0.73 * root.P);
        d3.select(arc)
                .transition()
                .duration(root.duration)
                .call(root.arcTween, angle);
    };

    CareerMap.prototype.hideDivisions = function (exceptId) {
        var root = this;
        // fade in all divisions except for selected
        root.group.selectAll('.division')
                .transition()
                .duration(300)
                .style('opacity', function () {
                    return (this.id === exceptId) ? 1 : .2;
                });
        // fade in selected division title             
        root.group.selectAll('g.division-title')
                .transition()
                .duration(root.duration)
                .style('opacity', function () {
                    return (this.id === exceptId + '-title') ? 1 : 0;
                });
    };

    CareerMap.prototype.showDivisions = function () {
        var root = this;
        // fade out all divisions
        root.group.selectAll('.division')
                .transition()
                .delay(300)
                .duration(300)
                .style('opacity', '1');
        // fade out division title             
        root.group.selectAll('g.division-title')
                .transition()
                .delay(500)
                .duration(300)
                .style('opacity', '1');
    };

    CareerMap.prototype.expandDivision = function (division) {
        var root = this;
        if (division.subdivisions) {
            $('#form-container').fadeOut(root.duration);
            root.hideDivisions(division.id);

            // get subs for selected division
            var subdivisions = root.data.subdivisions.filter(function (s) {
                return division.subdivisions.indexOf(s.id) >= 0;
            });

            // calculate angles for subs
            subdivisions.forEach(function (subdivision, i) {
                var j = division.i < 11 ? division.i + i : division.i - i;
                subdivision.initAngle = division.initAngle;
                subdivision.expandAngle = root.ArcLen * j;
            });

            // render subs
            root.group.selectAll('path.' + division.id + '-subdivision')
                    .data(subdivisions).enter()
                    // arc
                    .append('path')
                    .attr('class', division.id + '-subdivision subdivision')
                    .attr('id', function (d) {
                        return d.id;
                    })
                    .attr('d', root.arc)
                    .attr('cx', 100)
                    .attr('fill', function () {
                        return root.color(division.i);
                    });

            // move division title up
            root.group.selectAll('g#' + division.id + '-title>text')
                    .transition()
                    .duration(root.duration)
                    .style('fill', root.color(division.i))
                    .attr('dy', '-2em');

            // move subs
            division.subdivisions.forEach(function (id, i) {
                var j = division.i < 11 ? division.i + i : division.i - i;
                root.moveArc(d3.select('#' + id)[0][0], root.ArcLen * j);
            });

            // render sub titles
            root.group.selectAll('g.' + division.id + '-subdivision-title')
                    .data(subdivisions).enter()
                    // title group
                    .append('g')
                    .attr('class', division.id + '-subdivision-title subdivision-title')
                    .style('opacity', 0)
                    .attr('transform', function (d) {
                        return 'rotate(' + ((d.expandAngle + root.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
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

            root.group.selectAll('g.' + division.id + '-subdivision-title')
                    .transition()
                    .delay(300)
                    .duration(root.duration)
                    .style('opacity', '1');

            // render position trees
            root.group.selectAll('g.' + division.id + '-position-tree')
                    .data(subdivisions).enter()
                    // tree group
                    .append('g')
                    .attr('class', division.id + '-position-tree position-tree')
                    .attr('id', function (d) {
                        return d.id + '-position-tree';
                    })
                    .attr('transform', function (d) {
                        return 'rotate(' + ((d.expandAngle + root.ArcLen / 2).toDeg()) + ')';
                    })
                    .style('opacity', 0)
                    // tree trunk
                    .append('rect')
                    .attr('class', 'trunk')
                    .attr('x', -2)
                    .attr('y', -root.R)
                    .attr('width', 2)
                    .attr('height', function (d) {
                        return d.positions ? d.positions.length * 27 : 0;
                    })
                    .attr('fill', function (d, i) {
                        return root.color(division.i);
                    });

            subdivisions.forEach(function (sub) {
                var positions = [];
                if (sub.positions) {
                    positions = root.data.positions.filter(function (p) {
                        return sub.positions.indexOf(p.id) >= 0;
                    });
                }

                root.group.selectAll('g#' + sub.id + '-position-tree')
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
                            return -root.R + 30 * i + 20;
                        })
                        .attr('r', 7)
                        .style('fill', function (d, i) {
                            return root.color(division.i);
                        })
                        .style('stroke', function (d, i) {
                            return root.color(division.i);
                        })
                        .on('click', function (d) {
                            root.selectPosition(d.id);
                        })
                        // tooltip with position title
                        .append('title')
                        .text(function (d) {
                            return d.title;
                        });
            });

            root.group.selectAll('g.' + division.id + '-position-tree')
                    .transition()
                    .delay(300)
                    .duration(root.duration)
                    .style('opacity', '1');
        }
    };

    CareerMap.prototype.collapseDivision = function (division) {
        var root = this;

        $('#form-container').fadeIn(root.duration);
        $('#requirements-container').animate({'right': '-430'}, 750, 'easeInOutCubic');
        d3.selectAll('.spline').remove();
        root.showDivisions(division.id);
        if (division.subdivisions) {

            root.group.selectAll('g#' + division.id + '-title>text')
                    .transition()
                    .duration(root.duration)
                    .style('fill', '#494949')
                    .attr('dy', '.31em');
            division.subdivisions.forEach(function (id) {
                root.moveArc(d3.select('#' + id)[0][0], root.ArcLen * division.i);
            });
            // remove subdivisions
            root.group.selectAll('.subdivision')
                    .transition()
                    .delay(700)
                    .duration(500)
                    .style('opacity', '0')
                    .remove();
            // remove subdivision titles
            root.group.selectAll('g.subdivision-title')
                    .transition()
                    .duration(root.duration)
                    .style('opacity', '0')
                    .remove();
        }

        root.group.selectAll('.position-tree')
                .transition()
                .duration(500)
                .style('opacity', '0')
                .remove();
    };

    CareerMap.prototype.renderTitles = function (data, className) {
        var root = this;
        root.group.selectAll('g.' + className)
                .data(data).enter()
                .append('g')
                .attr('class', className)
                .attr('id', function (d) {
                    return d.id + '-title';
                })
                .attr('transform', function (d) {
                    return 'rotate(' + ((d.finalAngle + root.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
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
                    root.collapseDivision(d);
                });
    };

    CareerMap.prototype.renderDivisions = function () {
        var root = this;

        root.group.selectAll('.division').remove();
        root.group.selectAll('.subdivision').remove();
        root.group.selectAll('.subdivision-title').remove();
        root.group.selectAll('.position-tree').remove();
        root.group.selectAll('g.division-title')
                .transition()
                .style('opacity', '0');
        // render divisions
        root.group.selectAll('.division')
                .data(root.data.divisions).enter()
                .append('g')
                .attr('class', 'division')
                .attr('id', function (d) {
                    return d.id + 'g';
                })
                // arc
                .append('path')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('d', root.arc)
                .attr('cx', 100)
                .attr('fill', function (d) {
                    return root.color(d.i);
                })
                .on('click', function (d) {
                    root.expandDivision(d);
                });

        // arc in
        root.group.selectAll('.division')
                .data(root.data.divisions)
                .append('path')
                .attr('class', 'arc-in')
                .attr('d', root.arc1)
                .attr('cx', 100)
                .attr('fill', function (d) {
                    return 'gray';//root.color(d.i);
                });

        root.data.divisions.forEach(function (d, i) {
            root.moveArc(d3.select('#' + d.id)[0][0], d.finalAngle);
        });
        root.group.selectAll('g.division-title')
                .transition()
                .delay(750)
                .duration(root.duration)
                .style('opacity', '1');
    };

    CareerMap.prototype.selectPosition = function (currentId, expand) {
        expand = expand || false;
        var
                root = this,
                position = root.data.positions.filter(function (p) {
                    return p.id === currentId;
                })[0],
                subdivision = root.data.subdivisions.filter(function (s) {
                    return s.positions ? s.positions.indexOf(currentId) >= 0 : false;
                })[0],
                division = root.data.divisions.filter(function (s) {
                    return s.subdivisions ? s.subdivisions.indexOf(subdivision.id) >= 0 : false;
                })[0];
        if (expand) {
            root.expandDivision(division);
        }

        // show transitions
        if (root.mode === 1) {
            $('#target-position-container').show();
            root.renderTransitions(position);
        }
        else {
            $('#target-position-container').hide();
        }

        // show requirements
        $('#current-position').text(position.title);
        $('#current-position').css('color', root.color(division.i));
        $('#current-division').text(division.title);
        $('#position-profile').attr('href', position.profile ? position.profile : '#');
        $('#competency-matrix').attr('href', position.matrix ? position.matrix : '#');
        $('#requirements-container').animate({'right': '0'}, 750, 'easeInOutCubic');
        $('.position.active').attr('class', 'position');
        $('#' + currentId).attr('class', $('#' + currentId).attr('class') + ' active');
    };

    CareerMap.prototype.renderTransition = function (currentId, targetId) {
        var root = this;
        var target = d3.select('#' + targetId);

        // set colors
        d3.select('#gradient-d16-d4 .start').attr('stop-color', root.color(16));
        d3.select('#gradient-d16-d4 .finish').attr('stop-color', root.color(4));

        if (target[0][0]) {

            var c = d3.select('#' + currentId)[0][0].getBoundingClientRect(),
                    t = target[0][0].getBoundingClientRect(),
                    x1 = Math.round(c.left) - root.svgWidth / 2 - 105 - c.width / 2,
                    y1 = Math.round(c.top) - root.svgHeight / 2 + c.height / 2,
                    x2 = Math.round(t.left) - root.svgWidth / 2 - 105 - t.width / 2,
                    y2 = Math.round(t.top) - root.svgHeight / 2 + t.height / 2;
            var bezierLine = d3.svg.line()
                    .x(function (d) {
                        return d[0];
                    })
                    .y(function (d) {
                        return d[1];
                    })
                    .interpolate("basis");
            var
                    diffX = Math.abs(x1 - x2),
                    diffY = Math.abs(y1 - y2),
                    lineData =
                    [
                        [x1, y1],
                        [
                            diffX < root.R / 2 ? x1 + 5 : x1 + root.R,
                            diffX > 100 ? y1 - root.R / 3 : (Math.abs(y1 - y2) / 4)
                        ],
                        [x2, y2]
                    ];
            root.group.append('path')
                    .attr('d', bezierLine(lineData))
                    .attr('class', 'spline')
                    .attr('stroke', 'url(#gradient-d16-d4)')
                    .attr('stroke-width', 1)
                    .attr('fill', 'none')
                    .transition()
                    .duration(root.duration)
                    .attrTween('stroke-dasharray', function () {
                        var len = this.getTotalLength();
                        return function (t) {
                            return (d3.interpolateString('0,' + len, len + ',0'))(t);
                        };
                    });
        }
    };

    CareerMap.prototype.renderTransitions = function (position) {
        var root = this;

        d3.selectAll('.spline').remove();

        if (position.transition) {

            var targetSubdivisions = [],
                    targetSubdivisions1 = [],
                    targetDivisions = [],
                    targetDivisions1 = [];

            // find target subs
            // TODO crap !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            targetSubdivisions1 = root.data.subdivisions.filter(function (s) {
                var target = false;

                if (s.positions) {
                    s.positions.forEach(function (pId) {
                        target = position.transition.some(function (p) {
                            return p === pId;
                        });

                        if (target) {
//                            console.log(target, s.title);
                            targetSubdivisions.push(s.id);
                            return false;
                        }
                    });
                }

                return target;
            });
            console.log(targetSubdivisions);

            targetDivisions1 = root.data.divisions.filter(function (d) {
                var target = false;

                if (d.subdivisions) {
                    d.subdivisions.forEach(function (sId) {
                        target = targetSubdivisions.some(function (p) {
                            return p === sId;
                        });

                        if (target) {
                            if (targetDivisions.indexOf(d.id) < 0) {
                                targetDivisions.push(d);
                            }
                            return false;
                        }
                    });
                }
                return target;
            });
            console.log(targetDivisions);

            targetDivisions.forEach(function (d) {
                root.expandDivision(d);
            });

            // render transitions
            position.transition.forEach(function (tId) {
                root.renderTransition(position.id, tId);
            });
        }
        else {
            console.log('No positions');
        }
    };

    return CareerMap;
});
