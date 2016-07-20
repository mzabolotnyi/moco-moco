// Create our angular module
var App = angular.module('app', [
    'ngMessages',
    'ui.router',
    'mocoAuth'
]);

App
    // Constants definition
    .constant('config', {
        apiUrl: 'http://api.moco-moco',
        apiUrl: 'http://mocoservice.xyz',
        siteUrl: 'http://moco-moco',
        authHref: '/auth',
        appName: 'Money Control',
        appFullName: 'MOCO - Money Control',
        version: '1.0.0'
    });


