// SVG container

$(document).on('load', function () {
    var data = ['SDO', 'QAO'];

    var R = 200,
            CX = 100,
            CY = 100,
            P = Math.PI * 2,
            ArcLen = P / 10,
            ArcMargin = P / 200;

    var svg = d3.select("body").append("svg")
            .attr("width", 600)
            .attr("height", 600);
    var group = svg.append("g")
            .attr("transform", "translate(200, 200)");

// base circle

    var circleOut = group.append("circle")
            .attr("cx", CX)
            .attr("cy", CY)
            .attr('class', 'circle-main-out')
            .attr("r", R);

    var circleIn = group.append("circle")
            .attr("cx", CX)
            .attr("cy", CY)
            .attr('class', 'circle-main-in')
            .attr("r", R - 7);


// SDO
    var arc = d3.svg.arc()
            .innerRadius(R - 7)
            .outerRadius(R + 7)
            .startAngle(0)
            .endAngle(ArcLen - ArcMargin);

    group.append("path")
            .attr("d", arc)
            .attr('cx', 100)
            .attr("transform", "translate(100,100)")
            .attr('id', 'SDO');
// QAO
    var arc = d3.svg.arc()
            .innerRadius(R - 7)
            .outerRadius(R + 7)
            .startAngle(ArcLen)
            .endAngle(ArcLen * 2 - ArcMargin);

    group.append("path")
            .attr("d", arc)
            .attr('cx', 100)
            .attr("transform", "translate(100,100)")
            .attr('id', 'QAO');

    var path = svg.selectAll("path");


    $('#SDO').on('click', function () {

        arc
                .startAngle(ArcLen * 4 - ArcMargin)
                .endAngle(ArcLen * 3 - ArcMargin);

        svg.selectAll("#SDO")
                .attr("d", arc)
                .transition()
                //.ease("elastic")
                //.duration(750)
                .attrTween("d", arcTween);

    });
});

