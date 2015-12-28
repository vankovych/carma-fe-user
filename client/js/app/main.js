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
                .attr('width', CM.svgWidth)
                .attr('height', CM.svgHeight)
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

        d3.select('#decoration-arc-top .start').attr('stop-color', CM.color(22));
        d3.select('#decoration-arc-top .finish').attr('stop-color', CM.color(1));
        d3.select('#decoration-arc-bottom .start').attr('stop-color', CM.color(13));
        d3.select('#decoration-arc-bottom .finish').attr('stop-color', CM.color(10));

        $('#form-container').fadeIn(750);

        var positions = CM.data.positions.map(function (position) {
            return {
                id: position.id,
                label: position.title
            };
        });

        $('#positionTitle').val('');

        $("#positionTitle").autocomplete({
            minLength: 0,
            source: positions,
            focus: function (event, ui) {
                $("#positionTitle").val(ui.item.label);
                return false;
            },
            select: function (event, ui) {
                $("#positionTitle").val(ui.item.label);
                $("#positionId").val(ui.item.id);
                return false;
            }
        })
                .autocomplete("instance")._renderItem = function (ul, item) {
            return $("<li>")
                    .append("<a>" + item.label + "</a>")
                    .appendTo(ul);
        };
    });


    // Events

    // Menu navigation
    var $menuItems = $('nav ul a');
    $menuItems.on('click', function () {
        renderDivisions();
        $menuItems.removeClass('active');
        $(this).addClass('active');

        CM.mode = $(this).attr('data-mode');
    });

    $('#close-requirements').on('click', function () {
        $('#requirements-container').animate({'right': '-430'}, 250, 'easeInOutCubic');
    });

    $('#form-container').on('submit', function (e) {
        e.preventDefault();

        selectPosition($('#positionId').val(), true);
    });

    d3.select('nav h1').on('click', function () {

    });

};

Number.prototype.toDeg = function () {
    return this * (180 / Math.PI);
};