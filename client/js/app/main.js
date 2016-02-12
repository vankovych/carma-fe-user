/* main */

require([
    'd3',
    'jquery',
    'jqueryui',
    'app/CareerMap'
], function (d3, $, jqueryui, CareerMap) {
    'use strict';

    d3.json('data.json', function (error, json) {
        if (error) {
            return console.warn(error);
        }

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

        $('main').on('click', function (){
            CM.collapseAll();
        });

    });

});

Number.prototype.toDeg = function () {
    return this * (180 / Math.PI);
};
