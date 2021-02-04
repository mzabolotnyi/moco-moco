// Create our angular module
var App = angular.module('app', [
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'localytics.directives',
    'farbtastic',
    'angular-loading-bar',
    'infinite-scroll',
    'ui.bootstrap.contextMenu',
    'mocoAuth',
    'mocoProfile',
    'mocoBalance',
    'mocoCurrency',
    'mocoCategory',
    'mocoAccount',
    'mocoTransaction',
    'mocoAnalytics',
    'mocoImport'
]);

App
    // Constants definition
    .constant('config', {
        apiUrl: ApiHost,
        siteUrl: ClientHost,
        authHref: '/auth',
        appName: 'Money Control',
        appFullName: 'MOCO - Money Control',
        version: '1.0.0'
    });


