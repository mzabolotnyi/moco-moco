App
    // Router configuration
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'assets/views/pages/in-developing.html',
                controller: 'DashboardCtrl',
                //resolve: {
                //    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                //        return $ocLazyLoad.load({
                //            insertBefore: '#css-bootstrap',
                //            serie: true,
                //            files: [
                //                'assets/js/plugins/slick/slick.min.css',
                //                'assets/js/plugins/slick/slick-theme.min.css',
                //                'assets/js/plugins/slick/slick.min.js',
                //                'assets/js/plugins/chartjs/Chart.min.js'
                //            ]
                //        });
                //    }]
                //},
                pageTitle: 'Панель управления',
                viewLoader: true
            })
            .state('transactions', {
                url: '/transactions',
                templateUrl: 'assets/views/pages/common.html',
                abstract: true
            })
            .state('transactions.list', {
                url: '',
                templateUrl: 'assets/views/pages/in-developing.html',
                controller: 'TransactionsCtrl',
                pageTitle: 'Операции',
                viewLoader: true
            })
            .state('transactions.templates', {
                url: '/templates',
                templateUrl: 'assets/views/pages/in-developing.html',
                controller: 'TemplatesCtrl',
                pageTitle: 'Шаблоны',
                viewLoader: true
            })
            .state('accounts', {
                url: '/accounts',
                templateUrl: 'assets/views/pages/in-developing.html',
                controller: 'AccountsCtrl',
                pageTitle: 'Счета',
                viewLoader: true
            })
            .state('tags', {
                url: '/tags',
                templateUrl: 'assets/views/pages/in-developing.html',
                controller: 'TagsCtrl',
                pageTitle: 'Теги',
                viewLoader: true
            })
            .state('currencies', {
                url: '/currencies',
                templateUrl: 'assets/views/pages/currencies.html',
                controller: 'CurrenciesCtrl',
                viewLoader: true
            })
            .state('settings', {
                url: '/settings',
                templateUrl: 'assets/views/pages/settings.html',
                controller: 'SettingsCtrl',
                pageTitle: 'Настройки',
                viewLoad: true
            })
    })

    // Run our App
    .run(['$rootScope', '$window', 'config', 'auth', 'cfpLoadingBar', function ($rootScope, $window, config, auth, cfpLoadingBar) {

        // Detact Mobile Browser
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $('html').addClass('ismobile');
        }

        // Access config (constants) easily from all controllers
        $rootScope.config = config;

        // Define logic on state changing
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            cfpLoadingBar.start();
            if (!auth.isAuthenticated()) {
                event.preventDefault();
                $window.location.href = config.authHref;
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            setTimeout(function(){
                cfpLoadingBar.complete();
            }, 500);
            $rootScope.pageTitle = toState.pageTitle ? toState.pageTitle : config.appName;
        });
   }]);
