// Create our angular module
var App = angular.module('app', [
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'localytics.directives',
    'farbtastic',
    'angular-loading-bar',
    'infinite-scroll',
    'mocoAuth',
    'mocoProfile',
    'mocoBalance',
    'mocoCurrency',
    'mocoCategory',
    'mocoAccount',
    'mocoTransaction',
    'mocoAnalytics',
    'salesOrder',
    'salesSize'
]);

App
    // Constants definition
    .constant('config', {
        apiUrl: 'http://api.moco-moco',
        apiUrlSales: 'http://api.home/app_dev.php',
        siteUrl: 'http://moco-moco',
        authHref: '/auth',
        appName: 'Money Control',
        appFullName: 'MOCO - Money Control',
        version: '1.0.0'
    });


