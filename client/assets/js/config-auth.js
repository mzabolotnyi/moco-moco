App
    // Router configuration
    .config(function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'assets/views/partials/auth/login.html',
                controller: 'LoginCtrl',
                pageTitle: 'Вход'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: 'assets/views/partials/auth/signup.html',
                controller: 'SignupCtrl',
                pageTitle: 'Регистрация'
            })
            .state('forgotPassword', {
                url: '/forgot-password',
                templateUrl: 'assets/views/partials/auth/forgot-password.html',
                controller: 'ForgotPasswordCtrl',
                pageTitle: 'Восстановление пароля'
            })
    })

    // Run our App
    .run(['$rootScope', 'config', function ($rootScope, config) {

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            $rootScope.pageTitle = toState.pageTitle ? toState.pageTitle : $rootScope.config.appName;
        });
    }]);
