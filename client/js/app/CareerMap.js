/* Career Map module */

define('app/CareerMap', [
    'd3',
    'jquery',
    'jqueryui',
    'html5tooltips'
], function(d3, $, $ui, html5tooltips) {
    'use strict';

    var CareerMap = function(json) {
        var root = this;

        this.data = json;
        this.svgWidth = 1024;
        this.svgHeight = 900;
        this.R = 325;
        this.positionR = 8;
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
            .domain(this.data.divisions.map(function(d) {
                return d.i;
            }))
            .range(json.colors);

        this.arcTween = function(transition, newAngle) {
            transition.attrTween('d', function(d) {
                var interpolate = d3.interpolate(d.initAngle, newAngle);
                return function(t) {
                    d.initAngle = interpolate(t);
                    return root.arc(d);
                };
            });
        };

        this.arcTweenIn = function(transition, newAngle) {
            transition.attrTween('d', function(d) {
                var interpolate = d3.interpolate(d.initAngle, newAngle);
                return function(t) {
                    d.initAngle = interpolate(t);
                    return root.arcIn(d);
                };
            });
        };

        // Draw arc function
        this.arc = d3.svg.arc()
            .startAngle(function(d) {
                return d.initAngle;
            })
            .endAngle(function(d) {
                return d.initAngle + root.ArcLen - root.ArcMargin;
            })
            .innerRadius(root.R)
            .outerRadius(root.R + 20);

        // Draw arc function
        this.arcIn = d3.svg.arc()
            .startAngle(function(d) {
                return d.initAngle;
            })
            .endAngle(function(d) {
                return d.initAngle + root.ArcLen - root.ArcMargin;
            })
            .innerRadius(root.R)
            .outerRadius(root.R + 5);

        // Draw bezier curve
        this.bezierLine = d3.svg.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            })
            .interpolate('basis');

        this.init();
        this.renderDivisions(this.data.divisions);
    };

    CareerMap.prototype.init = function() {
        var root = this;

        // add additional data
        // FIXME remove repeate of additional data recalculation
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

        // center point to draw splines
        root.group
            .append('circle')
            .attr('id', 'cntr')
            .attr('cx', -1)
            .attr('cy', -1)
            .attr('r', 0)
            .style('fill', 'red');
    };

    /**
     * Move arc to position
     * 
     * @param {String} id Arc id
     * @param {Number} pos Target pos
     */
    CareerMap.prototype.moveArc = function(id, pos) {
        var root = this;

        d3.select('#' + id)
            .transition()
            .duration(root.duration)
            .call(root.arcTween, pos * root.ArcLen);

        d3.select('#' + id + '-in')
            .transition()
            .duration(root.duration)
            .call(root.arcTweenIn, pos * root.ArcLen);
    };

    /**
     * Render all divisions with animation
     */
    CareerMap.prototype.renderDivisions = function() {
        var root = this;

        // add additional data
        for (var i = 0, j = 1; i < this.data.divisions.length; i++, j++) {
            this.data.divisions[i].i = i;
            this.data.divisions[i].initAngle = 0;
            this.data.divisions[i].finalAngle = i;
            this.data.divisions[i].finalAngle1 = (i * root.ArcLen).toDeg();
        }

        // clean existing elements
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
            .on('click', function(d) {
                // allow manual expand of only single division
                if (!root.selected.divisionIds.length) {
                    root.selected.divisionIds.push(d.id);
                    root.expandDivision(d);
                }
            })
            // outer arc
            .append('path')
            .attr('id', function(d) {
                return d.id;
            })
            .attr('d', root.arc)
            .attr('cx', 100)
            .attr('fill', function(d) {
                return root.color(d.i).m;
            });

        // inner arc
        divisionSelection.append('path')
            .attr('id', function(d) {
                return d.id + '-in';
            })
            .attr('class', 'arc-in')
            .attr('d', root.arcIn)
            .attr('cx', 100)
            .attr('fill', function(d) {
                return root.color(d.i).d;
            });

        // animate divisions expanding from top start point
        root.data.divisions.forEach(function(d) {
            root.moveArc(d.id, d.finalAngle);
        });

        root.renderTitles(divisionSelection, 'division-title');
    };

    /**
     * Show all divisions
     */
    CareerMap.prototype.showDivisions = function() {
        var root = this;

        // fade out all divisions
        root.group.selectAll('.division path')
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

    /**
     * Hide divisions except for provided Id
     * @param  {String} exceptId Id of excepted division
     */
    CareerMap.prototype.hideDivisions = function(exceptId) {
        var root = this;

        // fade in all divisions except for selected
        root.group.selectAll('.division path')
            .transition()
            .duration(300)
            .style('opacity', function() {
                return (this.id === exceptId) ? 1 : 0.1;
            });

        // fade out not selected division title
        root.group.selectAll('g.division-title')
            .transition()
            .duration(root.duration)
            .style('opacity', function() {
                return (this.id === exceptId + '-title') ? 1 : 0;
            });
    };

    /**
     * Expand division
     * @param  {Object} division Division
     * @param  {Array} targets  Target positions
     */
    CareerMap.prototype.expandDivision = function(division, targets) {
        var root = this;

        targets = targets || [];

        if (division.subdivisions) {
            var subdivisions;

            root.selected.divisionIds.push(division.id);
            root.hideDivisions(division.id);

            // get subs for selected division
            subdivisions = root.data.subdivisions.filter(function(s) {
                var filter;

                filter = division.subdivisions.indexOf(s.id) >= 0;
                if (targets.length && filter && root.mode === 1) {
                    // for mode 1 display only subdivisions with positions where transitions is possible
                    // and position is in transition list
                    filter = false;
                    if (s.positions) {
                        s.positions.forEach(function(p) {
                            if (targets.indexOf(p) >= 0) {
                                filter = true;
                                return false;
                            }
                        });
                    }
                }
                return filter;
            });

            // calculate angles for subs
            subdivisions.forEach(function(subdivision, i) {
                var j = division.finalAngle < 11 ? division.finalAngle + i : division.finalAngle - i;
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
                .attr('id', function(d) {
                    return d.id + 'g';
                })
                // arc
                .append('path')
                .attr('id', function(d) {
                    return d.id;
                })
                .attr('d', root.arc)
                .attr('cx', 100)
                .attr('fill', function() {
                    return root.color(division.i).m;
                });

            // arc in
            subdivisionSelection.insert('path')
                .attr('id', function(d) {
                    return d.id + '-in';
                })
                .attr('class', 'arc-in')
                .attr('d', root.arcIn)
                .attr('cx', 100)
                .attr('fill', function(d) {
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
            subdivisions.forEach(function(s) {
                root.moveArc(s.id, s.finalAngle);
            });

            root.renderTitles(subdivisionSelection, division.id + '-subdivision-title', 'subdivision-title');

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
                .attr('id', function(d) {
                    return d.id + '-position-tree';
                })
                .attr('transform', function(d) {
                    return 'rotate(' + ((d.finalAngle * root.ArcLen + root.ArcLen / 2).toDeg()) + ')';
                })
                .style('opacity', 0)
                // tree trunk
                .append('rect')
                .attr('class', 'trunk')
                .attr('x', -2)
                .attr('y', -root.R)
                .attr('width', 2)
                .attr('height', function(d) {
                    return d.positions ? d.positions.length * 27 : 0;
                })
                .attr('fill', function() {
                    return root.color(division.i).m;
                });

            // render position leafs            
            subdivisions.forEach(function(sub) {
                var positions = [],
                    enabled = true;

                // get positions for specified subdivision
                if (sub.positions) {
                    positions = root.data.positions.filter(function(p) {
                        return sub.positions.indexOf(p.id) >= 0;
                    });
                }

                root.group.selectAll('g#' + sub.id + '-position-tree')
                    .selectAll('circle.position')
                    .data(positions).enter()
                    // position leaf
                    .append('circle')
                    .attr('id', function(d) {
                        return d.id;
                    })
                    .attr('cx', function() {
                        return -1;
                    })
                    .attr('cy', function(d, i) {
                        return -root.R + 30 * i + 20;
                    })
                    .attr('r', root.positionR)
                    .style('fill', function(d) {
                        // define color for enabled position,
                        // render positions as disabled after one more position
                        // after target position
                        var color;

                        if (enabled) {
                            color = root.color(division.i).m;
                            enabled = targets.indexOf(d.id) >= 0 ? false : true;
                        } else {
                            color = root.color(division.i).l;
                        }

                        return color;
                    })
                    .attr('class', function(d) {
                        return targets.indexOf(d.id) >= 0 ? 'position active' : 'position';
                    })
                    .style('stroke', function() {
                        return root.color(division.i).m;
                    })
                    .on('click', function(d) {
                        root.selectPosition(d.id);
                    })
                    .attr('data-tooltip', function(d) {
                        return d.title;
                    });
            });

            html5tooltips.refresh();

            // fade in position trees
            root.group.selectAll('g.' + division.id + '-position-tree')
                .transition()
                .delay(300)
                .duration(root.duration)
                .style('opacity', '1');

            $('#form-container').fadeOut(root.duration);
        }
    };

    /**
     * Collapse division
     * @param  {Object} division Division
     */
    CareerMap.prototype.collapseDivision = function(division) {
        var root = this;

        d3.selectAll('.spline').remove();
        root.showDivisions();

        if (division.subdivisions) {

            // move division title down
            root.group.selectAll('g#' + division.id + '-title>text')
                .transition()
                .duration(root.duration)
                .style('fill', '#494949')
                .attr('dy', '.31em');
            root.group.selectAll('g#' + division.id + '-title')
                .attr('class', 'division-title');

            division.subdivisions.forEach(function(id) {
                root.moveArc(id, division.i);
            });

            // remove subdivisions
            root.group.selectAll('.' + division.id + '-subdivision')
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
            root.group.selectAll('.' + division.id + '-position-tree')
                .transition()
                .duration(500)
                .style('opacity', '0')
                .remove();
        }
    };

    /**
     * Render Titles
     * @param  {Object} selection    Elements selection
     * @param  {String} className    Class name
     * @param  {String} classNameAdd Additional class name
     */
    CareerMap.prototype.renderTitles = function(selection, className, classNameAdd) {
        var root = this,
            selector;

        selector = '.' + className + (classNameAdd ? ' .' + classNameAdd : '');
        className += classNameAdd ? ' ' + classNameAdd : '';

        root.group.selectAll('g.' + className).remove();

        selection.append('g')
            .attr('class', className)
            .attr('id', function(d) {
                return d.id + '-title';
            })
            .attr('transform', function(d) {
                return 'rotate(' + ((d.finalAngle * root.ArcLen + root.ArcLen / 2).toDeg() - 90) + ')translate(' + 300 + ')';
            })
            .style('opacity', 0)
            .append('text')
            .text(function(d) {
                return d.abbreviation ? d.abbreviation : d.title;
            })
            .attr('dx', function(d) {
                return d.finalAngle1 < 180 ? 50 : -50;
            })
            .attr('dy', '.31em')
            .attr('text-anchor', function(d) {
                return d.finalAngle1 < 180 ? 'start' : 'end';
            })
            .attr('transform', function(d) {
                return d.finalAngle1 < 180 ? null : 'rotate(180)';
            })
            .attr('data-tooltip', function(d) {
                return d.title;
            });

        html5tooltips.refresh();

        // fade in titles
        root.group.selectAll(selector)
            .transition()
            .delay(root.duration)
            .duration(root.duration)
            .style('opacity', '1');
    };

    /**
     * Select position
     * @param  {String} currentId Current Id
     * @param  {Boolean} expand    
     */
    CareerMap.prototype.selectPosition = function(currentId, expand) {
        expand = expand || false;

        var root = this;

        // select only another position, avoid re-selection of the same position
        if (root.selected.positionId !== currentId) {
            var $positionsAccordion, position, subdivision, division, $selectedPosition;

            root.selected.positionId = currentId;

            // get 
            position = root.data.positions.find(function(p) {
                return p.id === currentId;
            });

            // select only position with transitions
            if (root.mode === 1 && !position.transition || position.transition.length === 0) {
                alert('No way!');
                return false;
            }

            subdivision = root.data.subdivisions.find(function(s) {
                return s.positions ? s.positions.indexOf(currentId) >= 0 : false;
            });

            division = root.data.divisions.find(function(d) {
                return d.subdivisions ? d.subdivisions.indexOf(subdivision.id) >= 0 : false;
            });

            if (expand) {
                root.expandDivision(division);
            }

            root.collapseAll(division.id);

            $positionsAccordion = $('#positions-accordion').empty();

            $('#current-position')
                .text(position.title)
                .css('color', root.color(division.i).m);
            $('#current-division').text(division.title);

            $('.position.active').attr('class', 'position');
            $selectedPosition = $('#' + currentId);
            $selectedPosition.attr('class', $selectedPosition.attr('class') + ' active');

            if (root.mode === 1) {
                // Build my career

                // if position has transitions
                if (position.transition) {
                    var enabled = true,
                        next = false,
                        positionsData = [];

                    // disable positions on current subdivision after current position plus next one                    
                    subdivision.positions.forEach(function(pId) {
                        if (!enabled) {
                            if (next) {
                                d3.select('#' + pId).style('fill', root.color(division.i).l);
                            } else {
                                // add next position on current subdivision to transitions
                                if (position.transition.indexOf(pId) === -1) {
                                    position.transition.unshift(pId);
                                }
                            }
                            next = true;
                        }

                        if (currentId === pId) {
                            enabled = false;
                        }
                    });

                    // get target positions data
                    positionsData = position.transition.map(function(tId) {
                        var pos, sub, div;

                        pos = root.data.positions.find(function(p) {
                            return p.id === tId;
                        });

                        sub = root.data.subdivisions.find(function(s) {
                            return s.positions ? s.positions.indexOf(tId) >= 0 : false;
                        });

                        div = root.data.divisions.find(function(d) {
                            return d.subdivisions ? d.subdivisions.indexOf(sub.id) >= 0 : false;
                        });

                        return {
                            positionTitle: pos.title,
                            divisionTitle: div.title,
                            divisionColor: div.i,
                            id: tId
                        };
                    });

                    root.renderTransitions(position);

                    positionsData.forEach(function(positionData) {
                        var positionRequirements, $accordionHeader;

                        positionRequirements = root.data.positionRequirementsMap.find(function(p) {
                            return p.positionId === positionData.id;
                        });

                        $accordionHeader = $('<div>', {
                                id: 'accordion-header-' + position.id + '-' + positionData.id,
                                class: 'accordion-header',
                                style: 'border-left-color: ' + root.color(positionData.divisionColor).d
                            })
                            .html('<div class="close-requirements">&times;</div>' +
                                '<h2 style="color:' + root.color(positionData.divisionColor).d + '">' +
                                positionData.positionTitle + '</h2>' +
                                '<h3>' + positionData.divisionTitle + '</h3>'
                            )
                            .hover(
                                // highlight corresponding spline and position on circle
                                function() {
                                    var splineId = '#' + currentId + '-' + positionData.id + '-spline';
                                    d3.select(splineId).attr('style', 'opacity: 1');
                                    d3.select('#' + positionData.id).classed('active', true);
                                },
                                function() {
                                    var splineId = '#' + currentId + '-' + positionData.id + '-spline';
                                    d3.select(splineId).attr('style', 'opacity: 0.5');
                                    d3.select('#' + positionData.id).classed('active', false);
                                }
                            );

                        $positionsAccordion.append($accordionHeader);

                        $positionsAccordion.append(root.createRequirementsList(position, positionRequirements));
                    });

                    $positionsAccordion.accordion('refresh');
                    $('#current-container').fadeIn();

                    $('.accordion-header').animate({
                        'margin-top': 0,
                        'opacity': 1
                    }, root.duration, 'easeInOutCubic');
                }

                // remove target position event
                $('.close-requirements').on('click', function(e) {
                    e.stopPropagation();
                    root.removeTransition(this);
                });
            } else if (root.mode === 2) {
                //Browse positions
                var positionRequirements;

                positionRequirements = root.data.positionRequirementsMap.find(function(p) {
                    return p.positionId === currentId;
                });

                $positionsAccordion
                    .append(root.createRequirementsList(position, positionRequirements))
                    .addClass('posreq');

                $('#current-container, #positions-accordion').fadeIn();
            }
        }
    };

    /**
     * Create Requirements List for specified Position with items from positionRequirements
     * @param  {Object} position             Position
     * @param  {Object} positionRequirements positionRequirements
     * @return {String}                      HTML String
     */
    CareerMap.prototype.createRequirementsList = function(position, positionRequirements) {
        var root = this,
            rli = '',
            requirementsList = '';

        if (positionRequirements) {
            var englishLevel, experience;

            englishLevel = root.data.englishLevels.find(function(e) {
                return e.id === positionRequirements.englishLevelId;
            });

            // English level
            rli += '<li>English ' + englishLevel.title + '</li>';

            experience = root.data.experiences.find(function(e) {
                return e.id === positionRequirements.experienceId;
            });

            // Experience
            rli += '<li>' + experience.title + '+ years of experience</li>';

            // Requirements
            root.data.requirements.forEach(function(r) {
                rli += '<li>' + r.description + '</li>';
            });

        } else {
            rli += '<li>(no requirements specified)</li>';
        }

        requirementsList =
            '<div><ul class="position-requirements">' + rli + '</ul>' +
            '<ul class="position-links">' +
            '<li><a href="' + (position.profile ? position.profile : '#') + '">View Job Profile</a></li>' +
            '<li><a href="' + (position.matrix ? position.matrix : '#') + '">View Competency Matrix</a></li>' +
            '</ul></div>';

        return requirementsList;
    };

    /**
     * Remove transition
     * @param  {Object} elem Element
     */
    CareerMap.prototype.removeTransition = function(elem) {
        // TODO do not remove sub of current pos

        var id,
            root = this,
            $header = $(elem).parent(),
            re = /-(.*)/,
            division,
            subdivision,
            positionId;

        id = $header.attr('id').replace('accordion-header-', '');
        positionId = re.exec(id)[1];

        subdivision = root.data.subdivisions.find(function(sub) {
            return sub.positions ? sub.positions.indexOf(positionId) >= 0 : false;
        });

        division = root.data.divisions.find(function(div) {
            return div.subdivisions ? div.subdivisions.indexOf(subdivision.id) >= 0 : false;
        });

        $header.fadeOut(250, function() {
            $(this).remove();
        });

        // remove elements related to target position
        [
            $('#' + id + '-spline'),
            $('#' + subdivision.id + '-position-tree'),
            $('#' + subdivision.id + 'g')
        ].forEach(function($elem) {
            $elem.fadeOut(250, function() {
                $elem.remove();
            });
        });

        // TODO hide division title
    };

    /**
     * Render transitions
     * @param  {[type]} position [description]
     */
    CareerMap.prototype.renderTransitions = function(position) {
        var root = this;

        d3.selectAll('.spline').remove();

        if (position.transition) {

            var targetSubdivisions = [],
                targetDivisions = [],
                currentSubdivision,
                currentDivision = {
                    id: ''
                },
                gradientId, poss = [];

            // find target subdivisions
            root.data.subdivisions.filter(function(s) {
                var target = false;

                if (s.positions) {
                    s.positions.forEach(function(pId) {
                        target = position.transition.some(function(p) {
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

            // find target divisions
            root.data.divisions.filter(function(d) {
                var target = false;

                if (d.subdivisions) {
                    d.subdivisions.forEach(function(sId) {
                        target = targetSubdivisions.some(function(s) {
                            return s === sId;
                        });

                        if (currentSubdivision.id === sId || d.subdivisions.indexOf(currentSubdivision.id) >= 0) {
                            currentDivision = d;
                        }

                        if (target) {
                            poss.forEach(function(e) {
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
            targetDivisions.forEach(function(d) {
                root.expandDivision(d, position.transition);

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
            poss.forEach(function(e) {
                var id = currentDivision.id + '-' + e.dId;
                root.renderTransitionSpline(position.id, e.pId, id);
            });

        }
    };

    /**
     * Render transition spline
     * @param  {String} currentId  Id of current position
     * @param  {String} targetId   Id of target position
     * @param  {String} gradientId Id of gradient
     */
    CareerMap.prototype.renderTransitionSpline = function(currentId, targetId, gradientId) {
        var root = this,
            selectedPos,
            targetPos,
            centerPos,
            p1, p2, pC,
            diff = { x: 0, y: 0 },
            points = [];

        selectedPos = d3.select('#' + currentId);
        centerPos = d3.select('#cntr');
        targetPos = d3.select('#' + targetId);

        p1 = root.getElementCoordinates(selectedPos);
        pC = root.getElementCoordinates(centerPos);
        p2 = root.getElementCoordinates(targetPos);

        // TODO: Improve spline drawing algorithm   

        diff.x = Math.abs(p1[0] - p2[0]);
        diff.y = Math.abs(p1[1] - p2[1]);

        //        console.log('--', targetId, '--');
        //        console.log(p1, p2, diff);

        if (diff.x < 100) {
            if (p1[0] > 0) {
                pC[0] = pC[0] + Math.min(Math.abs(p1[0]), Math.abs(p2[0])) - 20;
            } else {
                pC[0] = -Math.min(Math.abs(p1[0]), Math.abs(p2[0])) + 20;
            }
        }

        points = [p1, pC, p2];

        root.group.append('path')
            .attr('d', root.bezierLine(points))
            .attr('id', currentId + '-' + targetId + '-spline')
            .attr('class', 'spline')
            .attr('stroke', 'url(#gradient-' + gradientId + ')')
            .attr('fill', 'none')
            .transition()
            .duration(root.duration)
            .attrTween('stroke-dasharray', function() {
                var len = this.getTotalLength();
                return function(t) {
                    return (d3.interpolateString('0,' + len, len + ',0'))(t);
                };
            });
    };

    /**
     * Collapse all divisions
     * @param  {[type]} exceptDivisionId Id of excepted division
     */
    CareerMap.prototype.collapseAll = function(exceptDivisionId) {
        var root = this;

        exceptDivisionId = exceptDivisionId || false;

        root.selected.divisionIds.forEach(function(dId) {
            // collapse all divisions (except for exceptDivisionId)
            if (exceptDivisionId !== dId) {
                var division = root.data.divisions.find(function(d) {
                    return dId === d.id;
                });

                root.collapseDivision(division);
            }
        });

        if (!exceptDivisionId) {
            $('#form-container').fadeIn(root.duration);
            $('.accordion-header').animate({
                'margin-top': 300,
                'opacity': 0
            }, root.duration, 'easeInOutCubic');

            $('#current-container, #positions-accordion').fadeOut();

            root.selected.divisionIds = [];
            root.selected.positionId = '';
        }
    };

    /**
     * Make absolute context for element
     * @param  {Object} element Element
     */
    CareerMap.prototype.makeAbsoluteContext = function(element) {
        var svgDocument = document.querySelector('svg');

        return function(x, y) {
            var offset = svgDocument.getBoundingClientRect(),
                matrix = element.getScreenCTM();
            return {
                x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
                y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
            };
        };
    };

    /**
     * Get element coordinates
     * @param  {Object} element Element
     */
    CareerMap.prototype.getElementCoordinates = function(element) {
        var currentBBox,
            convertCurrent,
            absoluteCurrent,
            x, y;

        currentBBox = element[0][0].getBBox();
        convertCurrent = this.makeAbsoluteContext(element[0][0]);
        absoluteCurrent = convertCurrent(currentBBox.x + this.positionR, currentBBox.y + this.positionR);
        x = Math.round(absoluteCurrent.x - this.svgWidth / 2);
        y = Math.round(absoluteCurrent.y - this.svgHeight / 2);

        return [x, y];
    };

    return CareerMap;
});

/** 
 * TODO: positions like stickers
 * TODO: Move subs in case of overlapping
 * TODO: Complete restart button style
 */
