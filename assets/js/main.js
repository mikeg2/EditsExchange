
require.config({
    baseUrl: '/js/',
 // alias libraries paths
     paths: {
        "jquery": '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
        'jquery-migrate': '//cdnjs.cloudflare.com/ajax/libs/jquery-migrate/1.2.1/jquery-migrate.min',
        "jquery-smooth-scroll": "lib/jquery-smooth-scroll.min",
        "angular": '//ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular',
        "restangular": '//cdnjs.cloudflare.com/ajax/libs/restangular/1.4.0/restangular',
        "ip-cookie": '/js/ang/lib/angular-cookie.min',
        "underscore": '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min',
        "ng-tags-input": 'ang/lib/ng-tags-input.min',
        "ngsails": 'ang/lib/ngsails.io',
        "sails.io": 'sails.io',
        "socket.io": "socket.io",
        'ngRoute': '//ajax.googleapis.com/ajax/libs/angularjs/1.2.0rc1/angular-route.min',
        "angular-cookie": "//code.angularjs.org/1.0.0rc10/angular-cookies-1.0.0rc10",
        "angular-file-upload": "ang/lib/angular-file-upload",
        "angular-elastic": "ang/lib/elastic.min",
        'angular-fuse': 'ang/lib/angular-fuse',
        'angular-sanatize': '//ajax.googleapis.com/ajax/libs/angularjs/1.0.3/angular-sanitize.min',
        'tipped': 'lib/tipped/js/tipped/tipped',
        'angular-tipped': 'ang/lib/angular-tipped',

        'dropit': 'lib/dropit',
        'userDropDown': 'userDropDown'
     },
 
     // angular does not support AMD out of the box, put it in a shim
     shim: {
         'angular': {
             exports: 'angular'
         },
         'ngRoute': {
            deps: ['angular']
         },
         'angular-cookie': {
            deps: ['angular']
         },
         'ip-cookie': {
            deps: ['angular', 'angular-cookie']
         },
         'ng-tags-input': {
            deps: ['angular']
         },
         'restangular': {
            deps: ['angular']
         },
         'sails.io': {
            deps: ['socket.io']
         },
         'dropit': {
            deps: ['jquery']
         },
         'userDropDown': {
            deps: ['jquery']
         },
         'ngsails': {
            deps: ['sails.io', 'angular']
         },
         'jquery.browser.min': {
            deps: ['jquery']
         },
         'ice_tinymce/tinymce/jscripts/tiny_mce/tiny_mce': {
            deps: ['jquery']
         },
         'ice_tinymce/ice': {
            deps: ['ice_tinymce/tinymce/jscripts/tiny_mce/tiny_mce']
         },
         'angular-file-upload': {
            deps: ['angular']
         },
         'angular-elastic': {
            deps: ['angular']
         },
         'angular-fuse': {
            deps: ['angular']
         },
         'angular-sanatize': {
            deps: ['angular']
         },
         'tipped': {
            deps: ['jquery']
         },
         'angular-tipped': {
            deps: ['tipped']
         },
         'jquery-migrate': {
            deps: ['jquery']
         },
         "jquery-smooth-scroll": {
            deps: ['jquery']
         }
     },
 
     // kick start application
     deps: ['dropit',
            'userDropDown',
            'angular',
            'jquery',
            'restangular',
            'ip-cookie',
            'underscore',
            ]
 });