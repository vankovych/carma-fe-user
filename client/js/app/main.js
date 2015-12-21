'use strict';

window.onload = function () {

    d3.json('data.json', function (error, json) {
        if (error) {
            return console.warn(error);
        }

        CM.data = json;

        // create custom color scale from predifined colors
        CM.color = d3.scale.ordinal()
                .domain(CM.data.divisions.map(function (d) {
                    return d.i;
                }))
                .range(json.colors);

        CM.svg = d3.select('#map svg')
                .attr('width', CM.svgWidth)
                .attr('height', CM.svgHeight);
        CM.group = CM.svg.append('g')
                .attr('transform', 'translate(' + CM.svgWidth / 2 + ', ' + CM.svgHeight / 2 + ')');

        // add additional data
        for (var i = 0, j = 1; i < CM.data.divisions.length; i++, j++) {
            if (j === 11) {
                j += 2;
            }
            CM.data.divisions[i].i = j;
            CM.data.divisions[i].initAngle = 0;
            CM.data.divisions[i].finalAngle = CM.ArcLen * j;
        }

        renderTitles(CM.data.divisions, 'division-title');

        renderDivisions(CM.data.divisions);
    });


    // Events

    // Menu navigation
    var $menuItems = $('.menu ul a');
    $menuItems.on('click', function () {
        renderDivisions();
        $menuItems.removeClass('active');
        $(this).addClass('active');

        CM.mode = $(this).attr('data-mode');
    });

    d3.select('.menu h3').on('click', function () {

        var position = CM.data.positions.filter(function (p) {
            return p.id === 'p16';
        });

        renderTransitions(position[0]);

        var
                lineData = [
                    [
                        {'x': -CM.R + 30, 'y': 30},
                        {'x': -CM.R / 2, 'y': -100},
//                        {'x': CM.R - 100, 'y': -10},
                        {'x': CM.R - 50, 'y': -110}
                    ],
//                    [
//                        {'x': -CM.R + 30, 'y': 30},
//                        {'x': -CM.R / 2, 'y': -100},
//                        {'x': CM.R - 100, 'y': -10},
//                        {'x': CM.R - 80, 'y': -100}
//                    ],
//                    [
//                        {'x': -CM.R + 30, 'y': 30},
//                        {'x': -CM.R / 2, 'y': -100},
//                        {'x': CM.R - 100, 'y': 10},
//                        {'x': CM.R - 30, 'y': -40}
//                    ]
                ];

        var lineFunction = d3.svg.line()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .interpolate('basis');

//        CM.group.selectAll('path.spline')
//                .data(lineData).enter()
//                .append('path')
//                .attr('d', function (d) {
//                    return lineFunction(d);
//                })
//                .attr('stroke', CM.color(4))
//                .attr('stroke-width', 1)
//                .attr('fill', 'none');

//        CM.group.selectAll('path.spline')
//                .data(cords).enter()
//                .append('path')
//                .attr('d', function (d) {
//                    return lineFunction(d);
//                })
//                .attr('stroke', CM.color(4))
//                .attr('stroke-width', 1)
//                .attr('fill', 'none');

    });
};

Number.prototype.toDeg = function () {
    return this * (180 / Math.PI);
};