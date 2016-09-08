/*
 *  Document   : directives.js
 */

App

    // Add swipe right event for mobile
    .directive('onSwipeRight', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('swiperight', function (event) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onSwipeRight)
                    });
                });
            }
        }
    })

    // Add swipe left event for mobile
    .directive('onSwipeLeft', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('swipeleft', function (event) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onSwipeLeft)
                    });
                });
            }
        }
    })

    // Add long press event for mobile
    .directive('onLongPress', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('touchstart', function (event) {
                    // Locally scoped variable that will keep track of the long press
                    scope.longPress = true;

                    // We'll set a timeout for 600 ms for a long press
                    $timeout(function () {
                        if (scope.longPress) {
                            // If the touchend event hasn't fired,
                            // apply the function given in on the element's on-long-press attribute
                            event.preventDefault();
                            scope.$apply(function () {
                                scope.$eval(attrs.onLongPress)
                            });
                        }
                    }, 600);
                });

                element.bind('touchmove', function (event) {
                    // Prevent the onLongPress event from firing
                    scope.longPress = false;
                });

                element.bind('touchend', function (event) {
                    // Prevent the onLongPress event from firing
                    scope.longPress = false;
                });
            }
        };
    })

    // View loader functionality
    .directive('viewLoader', function () {
        return {
            templateUrl: function () {

                var template = 'assets/views/partials/loaders/loading-view.html';

                if ($('html').hasClass('ismobile')) {
                    template = 'assets/views/partials/loaders/loading-view-mobile.html';
                }

                return template;
            },
            link: function (scope, element) {

                // On state change start event, show the element if route has property "viewLoader"
                scope.$on('$stateChangeStart', function (event, toState) {
                    if (toState.viewLoader) {
                        $(element).fadeIn('fast');
                    }
                });

                // On state change success event, hide the element
                scope.$on('$stateChangeSuccess', function (event, toState) {
                    setTimeout(function () {
                        $(element).fadeOut('fast');
                    }, 500);
                });
            }
        };
    })

    // Directive for creating submit button with loading effect when submitting
    .directive('errorMessages', ['$compile', function ($compile) {
        return {
            link: function (scope, element) {

                // add if directive for inner content
                element.find('span')
                    .data('ng-if', '!submitting');

                // content when submitting
                var contentSubmitting = $('<span>');
                contentSubmitting.data('ng-if', 'submitting')
                    .html('<i class="fa fa-sun-o fa-spin"></i>');

                // complete submit button
                element.append(contentSubmitting)
                    .data('ng-disabled', 'form.$invalid||submitting')
                    .attr('type', 'submit');

                $compile(element)(scope);
            }
        };
    }])

    // Submenu toggle
    .directive('toggleSubmenu', function () {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    element.next().slideToggle(200);
                    element.parent().toggleClass('toggled');
                });
            }
        }
    })

    // Menu item on click must to close all opened submenus
    .directive('menuItem', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.click(function () {
                    var parentSubMenu = element.parent();
                    $('.main-menu .sub-menu > ul').not(parentSubMenu).slideUp(200);
                });
            }
        }
    })

    // Scroll on class 'c-overflow'
    .directive('cOverflow', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {

                $(element).niceScroll({
                    cursorcolor: 'rgba(0,0,0,0.4)',
                    cursorborder: 0,
                    cursorborderradius: 0,
                    cursorwidth: '4px',
                    bouncescroll: true,
                    mousescrollstep: 100,
                });
            }
        }
    })

    // Waves effect on buttons with class 'btn'
    .directive('btn', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if (element.hasClass('btn-icon') || element.hasClass('btn-float')) {
                    Waves.attach(element, ['waves-circle']);
                }

                else if (element.hasClass('btn-light')) {
                    Waves.attach(element, ['waves-light']);
                }

                else {
                    Waves.attach(element);
                }

                Waves.init();
            }
        }
    })

    // Add animated border and remove with condition when focus and blur on input with class 'form-control'
    .directive('formControl', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                if (element.is('input')) {
                    $(element).on('focus', function () {
                        $(this).closest('.fg-line').addClass('fg-toggled');
                    });

                    $(element).on('blur', function () {
                        var p = $(this).closest('.form-group');
                        var i = p.find('.form-control').val();

                        if (p.hasClass('fg-float')) {
                            if (i.length == 0) {
                                $(this).closest('.fg-line').removeClass('fg-toggled');
                            }
                        }
                        else {
                            $(this).closest('.fg-line').removeClass('fg-toggled');
                        }
                    });
                }
            }
        }
    })

    // Focus on input
    .directive('autofocus', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (attr.autofocus == 'true') {
                    $(element).find('input.autofocus').focus();
                }
            }
        }
    })

    // Create block header with breadcrumbs
    .directive('uiPageHeader', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            compile: function compile(element, attr) {

                var el = $(element);

                // add class to our element
                el.addClass('block-header');

                // append title block
                var title = attr.pageTitle;
                var titleBlock = $('<h2/>')
                    .addClass('m-b-10')
                    .text(title);

                el.append(titleBlock);

                // append breadcrumbs block
                if (attr.breadcrumbs) {

                    var breadcrumbs = $.parseJSON(attr.breadcrumbs); //{'dashboard' : 'Главная', 'activeCrumb' : 'Настройки'}
                    var breadcrumbBlock = $('<ul/>').addClass('breadcrumb');
                    var crumb, crumbLink;

                    $.each(breadcrumbs, function (key, value) {

                        crumb = $('<li/>');

                        if (key == 'activeCrumb') {
                            crumb.addClass('active')
                                .text(value);
                        } else {
                            crumbLink = $('<a/>')
                                .attr('ui-sref', key)
                                .text(value);
                            crumb.append(crumbLink);
                        }

                        breadcrumbBlock.append(crumb);
                    });

                    el.append(breadcrumbBlock);
                }
            }
        };
    }])

    // Format amount
    .directive('moneyFormat', function () {
        return {
            link: function (scope, element, attr) {

                var decimals = attr.decimals ? attr.decimals : 0;
                var sign = attr.sign ? attr.sign : "";

                scope.$watch(attr.amount, function (value) {
                    var displayValue = sign.concat($.number(value, decimals, '.', ','));
                    $(element).html(displayValue);
                });
            }
        };
    })

    .directive('datePicker', function () {
        return {
            restrict: 'A',
            scope: {
                datePicker: '&',
                datePickerModel: '='
            },
            link: function (scope, element, attrs) {

                var options = {
                    multipleDatesSeparator: ' - '
                };

                if (scope.$parent.global.isMobile()) {
                    options.selectButton = true;
                    options.cancelButton = true;
                }

                options = angular.extend(options, scope.datePicker());

                // view to model
                options.onSelectByButton = function (formattedDate, date, inst) {

                    if (!scope.datePickerModel){
                        scope.datePickerModel = {};
                    }

                    scope.datePickerModel.displayDate = formattedDate;

                    if (options.range) {
                        scope.datePickerModel.start = inst.minRange;
                        scope.datePickerModel.end = inst.maxRange;
                    }
                    else {
                        scope.datePickerModel.date = inst.focused;
                    }

                    scope.$applyAsync();
                };

                // model to view
                scope.$watch('ngModel', function (newVal) {
                    if (!newVal) return false;

                    //$(element).data('datepicker').selectDate(new Date(newVal));
                });
                //
                //// init
                //scope.$watch(function () {
                //    return scope.options();
                //}, function (newVal) {
                //    if (!newVal) return false;
                //
                //    if (newVal.minDate) newVal.minDate = new Date(newVal.minDate);
                //    if (newVal.maxDate) newVal.maxDate = new Date(newVal.maxDate);
                //
                //    $(element).data('datepicker').update(angular.extend(defaults, newVal));
                //}, true);

                $(element).datepicker(options);

            }
        };
    })

