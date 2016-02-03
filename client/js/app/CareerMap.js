/* Career Map module */

define('app/CareerMap', [
    'd3',
    'jquery',
    'jqueryui'
], function (d3, $) {
    'use strict';

    var CareerMap = function (json) {
        var root = this;

        this.data = json;
        this.svgWidth = 1024;
        this.svgHeight = 900;
        this.R = 325;
        // 1 - Build my career
        // 2 - Browse positions
        this.mode = 1;
        this.duration = 750;
        this.P = Math.PI * 2;
        this.ArcLen = root.P / root.data.divisions.length;
        this.ArcMargin = root.P / 400;

        this.selected = {
            divisionIds: [],
            positionId: ''
        };

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

        this.arcTweenIn = function (transition, newAngle) {
            transition.attrTween('d', function (d) {
                var interpolate = d3.interpolate(d.initAngle, newAngle);
                return function (t) {
                    d.initAngle = interpolate(t);
                    return root.arcIn(d);
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
        this.arcIn = d3.svg.arc()
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
        var root = this;

        // add additional data
        // TODO remove repeate
        for (var i = 0, j = 1; i < this.data.divisions.length; i++, j++) {
            this.data.divisions[i].i = i;
            this.data.divisions[i].initAngle = 0;
            this.data.divisions[i].finalAngle = i;
            this.data.divisions[i].finalAngle1 = (i * root.ArcLen).toDeg();
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

    /**
     * Move arc to angle
     * 
     * @param {String} id Arc id
     * @param {Number} angle Target angle
     */
    CareerMap.prototype.moveArc = function (id, angle) {
        var root = this;

        d3.select('#' + id)
                .transition()
                .duration(root.duration)
                .call(root.arcTween, angle * root.ArcLen);

        d3.select('#' + id + '-in')
                .transition()
                .duration(root.duration)
                .call(root.arcTweenIn, angle * root.ArcLen);
    };

    /**
     * Render all divisions with animation
     */
    CareerMap.prototype.renderDivisions = function () {
        var root = this;

        // add additional data
        for (var i = 0, j = 1; i < this.data.divisions.length; i++, j++) {
            this.data.divisions[i].i = i;
            this.data.divisions[i].initAngle = 0;
            this.data.divisions[i].finalAngle = i;
            this.data.divisions[i].finalAngle1 = (i * root.ArcLen).toDeg();
        }

        root.group.selectAll('.division').remove();
        root.group.selectAll('.subdivision').remove();
        root.group.selectAll('.subdivision-title').remove();
        root.group.selectAll('.position-tree').remove();
        root.group.selectAll('.division-title')
                .transition()
                .style('opacity', '0');

        // render divisions
        var divisionSelection = root.group.selectAll('.division')
                .data(root.data.divisions);

        divisionSelection.enter()
                // group
                .append('g')
                .attr('class', 'division')
//                .attr('id', function (d) {
//                    return d.id + 'g';
//                })
                .on('click', function (d) {
                    root.expandDivision(d);
                })
                // arc
                .append('path')
                .attr('id', function (d) {
                    return d.id;
                })
                .attr('d', root.arc)
                .attr('cx', 100)
                .attr('fill', function (d) {
                    return root.color(d.i).m;
                });

        // arc in
        divisionSelection.append('path')
                .attr('id', function (d) {
                    return d.id + '-in';
                })
                .attr('class', 'arc-in')
                .attr('d', root.arcIn)
                .attr('cx', 100)
                .attr('fill', function (d) {
                    return root.color(d.i).d;
                });

        root.data.divisions.forEach(function (d) {
            root.moveArc(d.id, d.finalAngle);
        });

        root.group.selectAll('g.division-title')
                .transition()
                .delay(750)
                .duration(root.duration)
                .style('opacity', '1');
    };

    CareerMap.prototype.hideDivisions = function (exceptId) {
        var root = this;
        // fade in all divisions except for selected
        root.group.selectAll('.division')
                .transition()
                .duration(300)
                .style('opacity', function () {
                    return (this.id === exceptId) ? 1 : 0.2;
                });

        // fade out selected division title
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

    CareerMap.prototype.expandDivision = function (division, targets) {
        var root = this;

        targets = targets || [];

        if (division.subdivisions) {

            root.selected.divisionIds.push(division.id);

            root.hideDivisions(division.id);

//            var targets = ["p11", "p1", "p17", "p18", "p13"];

//            console.log(root.data.subdivisions);

            // get subs for selected division
            var subdivisions = root.data.subdivisions.filter(function (s) {
                var filter = division.subdivisions.indexOf(s.id) >= 0;

                if (s.id !== 's8' && s.id !== 's9') {

                    if (targets.length) {

                        if (filter) {
                            // for mode 1 display only subdivisions with positions where transitions is possible
                            if (root.mode === 1) {
                                filter = false;
                                if (s.positions) {
                                    s.positions.forEach(function (p) {
                                        if (targets.indexOf(p) >= 0) {
                                            filter = true;
                                            return false;
                                        }
                                    });
                                }
                            }
                        }
                    }
                }

                return filter;
            });

            // calculate angles for subs
            subdivisions.forEach(function (subdivision, i) {
                var j = division.i < 11 ? division.i + i : division.i - i;
                subdivision.initAngle = division.initAngle;
                subdivision.finalAngle = j;
                subdivision.finalAngle1 = (j * root.ArcLen).toDeg();
            });

            // render subs
            var subdivisionSelection = root.group.selectAll(division.id + '-subdivision')
                    .data(subdivisions);

            subdivisionSelection.enter()
                    // group
                    .append('g')
                    .attr('class', division.id + '-subdivision subdivision')
                    .attr('id', function (d) {
                        return d.id + 'g';
                    })
                    // arc
                    .append('path')
//                    .attr('class', division.id + '-subdivision subdivision')
                    .attr('id', function (d) {
                        return d.id;
                    })
                    .attr('d', root.arc)
                    .attr('cx', 100)
                    .attr('fill', function () {
                        return root.color(division.i).m;
                    });

            // arc in
            subdivisionSelection.insert('path')
                    .attr('id', function (d) {
                        return d.id + '-in';
                    })
                    .attr('class', 'arc-in')
                    .attr('d', root.arcIn)
                    .attr('cx', 100)
                    .attr('fill', function (d) {
                        return root.color(division.i).d;
                    });

            // move division title up
            root.group.select('g#' + division.id + '-title')
                    .attr('class', 'division-title-moved');
            root.group.select('g#' + division.id + '-title>text')
                    .transition()
                    .duration(root.duration)
                    .style('fill', root.color(division.i).d)
                    .attr('dy', '-2em');

            // move subs
            subdivisions.forEach(function (s, i) {
                root.moveArc(s.id, s.finalAngle);
            });

            root.renderTitles(subdivisions, division.id + '-subdivision-title', 'subdivision-title');

            // fade in subdivision titles
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
                        return 'rotate(' + ((d.finalAngle * root.ArcLen + root.ArcLen / 2).toDeg()) + ')';
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
                    .attr('fill', function () {
                        return root.color(division.i).m;
                    });

            // render position leafs
            subdivisions.forEach(function (sub) {
                var positions = [];

                // get positions for specified subdivision
                if (sub.positions) {
                    positions = root.data.positions.filter(function (p) {
                        return sub.positions.indexOf(p.id) >= 0;
                    });
                }

                // TODO: render disabled positions

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
                            return root.color(division.i).m;
                        })
                        .style('stroke', function (d, i) {
                            return root.color(division.i).m;
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

            // fade in position trees
            root.group.selectAll('g.' + division.id + '-position-tree')
                    .transition()
                    .delay(300)
                    .duration(root.duration)
                    .style('opacity', '1');

            $('#form-container').fadeOut(root.duration);
        }
    };

    CareerMap.prototype.collapseDivision = function (division) {
        var root = this;

        $('#form-container').fadeIn(root.duration);
        $('#requirements-container').animate({'right': '-430'}, 750, 'easeInOutCubic');
        d3.selectAll('.spline').remove();
        root.showDivisions(division.id);

        if (division.subdivisions) {

            // move division title down
            root.group.selectAll('g#' + division.id + '-title>text')
                    .transition()
                    .duration(root.duration)
                    .style('fill', '#494949')
                    .attr('dy', '.31em');
            root.group.selectAll('g#' + division.id + '-title')
                    .attr('class', 'division-title');

            division.subdivisions.forEach(function (id) {
                root.moveArc(id, division.i);
            });

            // remove subdivisions
            root.group.selectAll('.subdivision')
                    .transition()
                    .delay(root.duration - 50)
                    .duration(root.duration * 0.66)
                    .style('opacity', '0')
                    .remove();

            // remove subdivision titles
            root.group.selectAll('.' + division.id + '-subdivision-title.subdivision-title')
                    .transition()
                    .duration(root.duration)
                    .style('opacity', '0')
                    .remove();

            // remove trees
            root.group.selectAll('.position-tree')
                    .transition()
                    .duration(500)
                    .style('opacity', '0')
                    .remove();
        }
    };

    CareerMap.prototype.renderTitles = function (data, className, classNameAdd) {
        var root = this;

        className += classNameAdd ? ' ' + classNameAdd : '';

        root.group.selectAll('g.' + className).remove();

        root.group.selectAll('g.' + className)
                .data(data).enter()
                .append('g')
                .attr('class', className)
                .attr('id', function (d) {
                    return d.id + '-title';
                })
                .attr('transform', function (d) {
                    return 'rotate(' + ((d.finalAngle * root.ArcLen + root.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
                })
                .style('opacity', 0)
                .append('text')
                .text(function (d) {
                    return d.abbreviation ? d.abbreviation : d.title;
                })
                .attr('dx', function (d) {
                    return d.finalAngle1 < 180 ? 50 : -50;
                })
                .attr('dy', '.31em')
                .attr('text-anchor', function (d) {
                    return d.finalAngle1 < 180 ? 'start' : 'end';
                })
                .attr('transform', function (d) {
                    return d.finalAngle1 < 180 ? null : 'rotate(180)';
                })
                .on('click', function (d) {
                    root.collapseDivision(d);
                })
                // tooltip with title
                .append('title')
                .text(function (d) {
                    return d.title;
                });
        ;
    };

    CareerMap.prototype.selectPosition = function (currentId, expand) {
        expand = expand || false;

        var root = this, position, subdivision, division;

        // select only new position, avoid re-selection
        if (root.selected.positionId !== currentId) {
            root.selected.positionId = currentId;

            position = root.data.positions.filter(function (p) {
                return p.id === currentId;
            })[0];

            subdivision = root.data.subdivisions.filter(function (s) {
                return s.positions ? s.positions.indexOf(currentId) >= 0 : false;
            })[0];

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

                var positionsData = [];
                position.transition.forEach(function (tId) {

                    var pos = root.data.positions.find(function (p) {
                        return p.id === tId;
                    });

                    var positionData = {
                        positionTitle: pos.title,
                        divisionTitle: 'Quality Assurance',
                        divisionColor: 4
                    };

                    positionsData.push(positionData);
                });

                var rli = '';
                positionsData.forEach(function (positionData) {
                    rli += '<li>'
                            + '<h2 style="color:' + root.color(positionData.divisionColor).d + '">'
                            + positionData.positionTitle + '</h2>'
                            + '<h3>' + positionData.divisionTitle + '<h3>'
                            + '</li>';
                });

                $('#position-list').empty().html(rli);

            }
            else {
                $('#target-position-container').hide();
            }

            // show requirements
            $('#current-position').text(position.title)
                    .css('color', root.color(division.i).m);
            $('#current-division').text(division.title);

//        $('#target-position').text(position.title)
//                .css('color', root.color(division.i).m);
//        $('#target-division').text(division.title);

            var positionData = root.data.positionRequirementsMap.find(function (p) {
                return p.positionId === currentId;
            });

            var rli = '';
            if (positionData) {

                var englishLevel = root.data.englishLevels.find(function (e) {
                    return e.id === positionData.englishLevelId;
                });

                rli += '<li>English ' + englishLevel.title + '</li>';

                var experience = root.data.experiences.find(function (e) {
                    return e.id === positionData.experienceId;
                });

                rli += '<li>' + experience.title + '+ years of experience</li>';

                root.data.requirements.forEach(function (r) {
                    rli += '<li>' + r.description + '</li>';
                });

            } else {
                rli += '<li>(no requirements specified)</li>';
            }

            $('#position-requirements').empty().html(rli);

            $('#position-profile').attr('href', position.profile ? position.profile : '#');
            $('#competency-matrix').attr('href', position.matrix ? position.matrix : '#');
            $('#requirements-container').animate({'right': '0'}, 750, 'easeInOutCubic');
            $('.position.active').attr('class', 'position');
            $('#' + currentId).attr('class', $('#' + currentId).attr('class') + ' active');

        }
    };

    CareerMap.prototype.renderTransition = function (currentId, targetId, gradientId) {
        var root = this,
                targetPos;

        targetPos = d3.select('#' + targetId);

        if (targetPos[0][0]) {

            var currentBounding, targetBounding, x1, x2, y1, y2,
                    offsetX = 290;
//            offsetX = 0;
            currentBounding = d3.select('#' + currentId)[0][0].getBoundingClientRect();
            targetBounding = targetPos[0][0].getBoundingClientRect();

            //x1 = Math.round(currentBounding.left) - root.svgWidth / 2 - offsetX - currentBounding.width / 2;
            x1 = Math.round(currentBounding.left) - root.svgWidth / 2 - offsetX;
            y1 = Math.round(currentBounding.top) - root.svgHeight / 2 + currentBounding.height / 2;
            x2 = Math.round(targetBounding.left) - root.svgWidth / 2 - offsetX - targetBounding.width / 2;
            y2 = Math.round(targetBounding.top) - root.svgHeight / 2 + targetBounding.height / 2;

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
//                        [
//                            root.R / 2 - 250,
//                            root.R / 2
//                        ],
                        [x2, y2]
                    ];

            root.group.append('path')
                    .attr('d', bezierLine(lineData))
                    .attr('class', 'spline')
                    .attr('stroke', 'url(#gradient-' + gradientId + ')')
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
                    targetDivisions = [],
                    currentSubdivision,
                    currentDivision = {
                        id: ''
                    }, gradientId, poss = [];

            // find target subs
            root.data.subdivisions.filter(function (s) {
                var target = false;

                if (s.positions) {
                    s.positions.forEach(function (pId) {
                        target = position.transition.some(function (p) {
                            return p === pId;
                        });

                        // subdivision of selected position
                        if (position.id === pId) {
                            currentSubdivision = s;
                        }

                        if (target) {
                            poss.push({
                                pId: pId,
                                sId: s.id
                            });
                            targetSubdivisions.push(s.id);
                            return false;
                        }
                    });
                }

                return target;
            });

            // find target divs
            root.data.divisions.filter(function (d) {
                var target = false;

                if (d.subdivisions) {
                    d.subdivisions.forEach(function (sId) {
                        target = targetSubdivisions.some(function (s) {
                            return s === sId;
                        });

                        if (currentSubdivision.id === sId || d.subdivisions.indexOf(currentSubdivision.id) >= 0) {
                            currentDivision = d;
                        }

                        if (target) {

                            poss.forEach(function (e) {
                                if (e.sId === sId) {
                                    e.dId = d.id;
                                }
                            });

                            if (targetDivisions.indexOf(d) < 0 && d.id !== currentDivision.id) {
                                targetDivisions.push(d);
                            }
                            return false;
                        }
                    });
                }
                return target;
            });

            // expand divisions, add gradients
            targetDivisions.forEach(function (d) {
                root.expandDivision(d, ["p11", "p1", "p17", "p18", "p13"]);

                gradientId = 'gradient-' + currentDivision.id + '-' + d.id;

                if (d3.select('#' + gradientId).empty()) {
                    var linearGradient = d3.select('defs')
                            .append('linearGradient')
                            .attr('id', gradientId);
                    linearGradient.append('stop')
                            .attr('offset', '0%')
                            .attr('class', 'start')
                            .attr('stop-color', root.color(currentDivision.i).m);
                    linearGradient.append('stop')
                            .attr('offset', '100%')
                            .attr('class', 'finish')
                            .attr('stop-color', root.color(d.i).m);
                }
            });

            gradientId = 'gradient-' + currentDivision.id + '-' + currentDivision.id;
            if (d3.select('#' + gradientId).empty()) {
                var linearGradient = d3.select('defs')
                        .append('linearGradient')
                        .attr('id', gradientId);
                linearGradient.append('stop')
                        .attr('offset', '0%')
                        .attr('class', 'start')
                        .attr('stop-color', root.color(currentDivision.i).m);
                linearGradient.append('stop')
                        .attr('offset', '100%')
                        .attr('class', 'finish')
                        .attr('stop-color', root.color(currentDivision.i).m);
            }

            // render transitions
            poss.forEach(function (e) {
                var id = currentDivision.id + '-' + e.dId;
                root.renderTransition(position.id, e.pId, id);
            });

        }
    };

    CareerMap.prototype.collapseAll = function () {
        var root = this;

        root.selected.divisionIds.forEach(function (dId) {
            var division = root.data.divisions.find(function (d) {
                return dId === d.id;
            });

            root.collapseDivision(division);
        });

        root.selected.divisionIds = [];
        root.selected.positionId = '';
    };

    CareerMap.prototype.wrapTitle = function (text, width) {
        text.each(function () {
            var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan;
            tspan = text.text(null)
                    .append("tspan");
//                .attr("x", 0)
//                .attr("y", y)
//                .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text
                            .append("tspan")
                            .attr("x", '3em')
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
                }
            }
        });
    };

    return CareerMap;
});

/**
 * TODO: Style tooltips
 * FIXME: Drawing positions connections
 * TODO: Improve spline drawing algorithm
 * TODO: Show only subs with transitions
 * TODO: Move subs in case of overlapping
 * TODO: collapse on background click
 * TODO: finish div/sub arc
 */