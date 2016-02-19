/* main */

require([
    'd3',
    'jquery',
    'jqueryui',
    'html5tooltips',
    'app/CareerMap'
], function (d3, $, jqueryui, html5tooltips, CareerMap) {
    'use strict';

    d3.json('data.json', function (error, json) {
        if (error) {
            return console.warn(error);
        }
        
        html5tooltips.autoinit();

        var CM = new CareerMap(json);

        // autocomplete form
        $('#form-container').fadeIn(CM.duration);

        $('#positionTitle')
                .val('')
                .autocomplete({
                    minLength: 0,
                    source: CM.data.positions.map(function (position) {
                        return {
                            id: position.id,
                            label: position.title
                        };
                    }),
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
                .autocomplete('instance')._renderItem = function (ul, item) {
            return $('<li>')
                    .append('<a>' + item.label + '</a>')
                    .appendTo(ul);
        };

        // menu navigation
        var $menuItems = $('nav ul a');
        $menuItems.on('click', function () {
            CM.mode = 1 * $(this).attr('data-mode');
            CM.collapseAll();
            CM.renderDivisions();

            $menuItems.removeClass('active');
            $(this).addClass('active');

//            CM.moveArc('d4', 1);            
        });

        // close requirements
        $('#close-requirements').on('click', function () {
            CM.collapseAll();
        });

        // form submit
        $('#form-container').on('submit', function (e) {
            e.preventDefault();
            CM.selectPosition($('#positionId').val(), true);
        });

        $('#positions-accordion').accordion({
            collapsible: true,
            active: false,
            icons: false,
            header: 'div.accordion-header'
        });

        $('#button-collapse').on('click', function () {
            CM.collapseAll();
        });

    });
    
    

//    html5tooltips({
//        animateFunction: "spin",
//        color: "bamboo",
//        contentText: "Refresh",
//        stickTo: "right",
//        targetSelector: "#refresh"
//    });

});

Number.prototype.toDeg = function () {
    return this * (180 / Math.PI);
};
