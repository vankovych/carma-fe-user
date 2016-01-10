/* config */
'use strict';

requirejs.config({
    baseUrl: 'js',
    paths: {
        d3: 'vendor/d3/d3.min',
        jquery: 'vendor/jquery/jquery-2.1.4.min',
        jqueryui: 'vendor/jquery-ui/jquery-ui.min'
    }
});

requirejs(['app/main']);
