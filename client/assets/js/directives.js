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

    // Fixed block on scrolling
    .directive('fixedOnScroll', function () {
        return {
            link: function (scope, element, attr) {

                var elementPosition = $(element).offset();
                var elementWidth = $(element).outerWidth();
                var top = attr.fixedOnScroll == "" ? 85 : parseFloat(attr.fixedOnScroll);

                $(window).scroll(function () {

                    var fromTop = elementPosition.top - $(window).scrollTop();

                    if (attr.widthRelation) {
                        elementWidth = $("#" + attr.widthRelation).outerWidth();
                    }

                    if (fromTop < top) {
                        $(element).css({
                            'position': 'fixed',
                            'width': elementWidth,
                            'top': top
                        });
                    } else {
                        $(element).css({
                            'position': 'static',
                            'width': 'auto'
                        });

                        elementWidth = $(element).outerWidth();
                    }
                });
            }
        };
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

    // Reset form
    .directive('focusFormOnClick', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {

                var formId = attr.focusFormOnClick;

                $(element).click(function () {
                    $('#' + formId).find('input.autofocus').focus();
                })
            }
        }
    })

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

    // Directive for pie charts
    .directive('hcPieChart', function () {
        return {
            scope: {
                data: '=',
                showLabels: '='
            },
            link: function (scope, element, attr) {

                scope.$watch('data', function () {
                    var colorSet = Highcharts.colorSets[attr.colorSet]
                        ? Highcharts.colorSets[attr.colorSet] : Highcharts.getOptions().colors;

                    Highcharts.chart(element[0], {
                        title: false,
                        colors: colorSet,
                        series: [{
                            data: scope.data,
                            dataLabels: {
                                enabled: scope.showLabels == undefined ? false : scope.showLabels,
                                format: '<b>{point.name}</b>: {point.y:.2f} ({point.percentage:.1f}%)'
                            }
                        }],
                        tooltip: {
                            headerFormat: '<span style="font-size:14px">{point.key}</span><br>',
                            pointFormat: '<b>{point.y:.2f}</b> ({point.percentage:.1f}%)'
                        },
                        chart: {
                            type: 'pie',
                            events: {
                                load: function (event) {
                                    var total = this.series[0].data[0].total;
                                    var text = this.renderer.text(
                                        'Всего: ' + total.toFixed(2),
                                        this.plotLeft,
                                        this.plotTop
                                    ).attr({
                                            zIndex: 5
                                        }).add(); // write it to the upper left hand corner
                                }
                            }
                        }
                    });
                })
            }
        };
    })

    // Directive for income+expense chart
    .directive('hcIncExpChart', function () {
        return {
            scope: {
                //incomeData: '=',
                //showLabels: '='
            },
            link: function (scope, element, attr) {

                //scope.$watch('data', function () {

                    Highcharts.chart(element[0], {
                        chart: {
                            type: 'column'
                        },
                        title: false,
                        xAxis: [{
                            type: 'category',
                            crosshair: true
                        }],
                        yAxis: { // Primary yAxis
                            title: {
                                text: 'Доход / Расход',
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        tooltip: {
                            headerFormat: '<span style="font-size:14px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y:.2f}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        series: [{
                            name: 'Доходы',
                            type: 'column',
                            color: '#00a65a',
                            yAxis: 0,
                            data: [                        {
                                name: "янв, 16",
                                y: 12495,
                                drilldown: "income_2016_01"
                            },
                                {
                                    name: "фев, 16",
                                    y: 26073.35,
                                    drilldown: "income_2016_02"
                                },
                                {
                                    name: "март, 16",
                                    y: 25176,
                                    drilldown: "income_2016_03"
                                },
                                {
                                    name: "апр, 16",
                                    y: 35180,
                                    drilldown: "income_2016_04"
                                },
                                {
                                    name: "май, 16",
                                    y: 23394,
                                    drilldown: "income_2016_05"
                                },
                                {
                                    name: "июнь, 16",
                                    y: 27547.44,
                                    drilldown: "income_2016_06"
                                },
                                {
                                    name: "июль, 16",
                                    y: 37270.88,
                                    drilldown: "income_2016_07"
                                },
                                {
                                    name: "авг, 16",
                                    y: 34334,
                                    drilldown: "income_2016_08"
                                },
                                {
                                    name: "сен, 16",
                                    y: 15748,
                                    drilldown: "income_2016_09"
                                },
                                {
                                    name: "окт, 16",
                                    y: 34438,
                                    drilldown: "income_2016_10"
                                },
                                {
                                    name: "нояб, 16",
                                    y: 12168,
                                    drilldown: "income_2016_11"
                                },
                                {
                                    name: "дек, 16",
                                    y: 9032,
                                    drilldown: "income_2016_12"
                                },
                            ]
                        }, {
                            name: 'Расходы',
                            type: 'column',
                            yAxis: 0,
                            color: '#c74b1f',
                            data: [
                                {
                                    name: "янв, 16",
                                    y: 14578,
                                    drilldown: "expense_2016_01"
                                },
                                {
                                    name: "фев, 16",
                                    y: 15714,
                                    drilldown: "expense_2016_02"
                                },
                                {
                                    name: "март, 16",
                                    y: 29774,
                                    drilldown: "expense_2016_03"
                                },
                                {
                                    name: "апр, 16",
                                    y: 29918,
                                    drilldown: "expense_2016_04"
                                },
                                {
                                    name: "май, 16",
                                    y: 32740,
                                    drilldown: "expense_2016_05"
                                },
                                {
                                    name: "июнь, 16",
                                    y: 20367,
                                    drilldown: "expense_2016_06"
                                },
                                {
                                    name: "июль, 16",
                                    y: 27730,
                                    drilldown: "expense_2016_07"
                                },
                                {
                                    name: "авг, 16",
                                    y: 23861,
                                    drilldown: "expense_2016_08"
                                },
                                {
                                    name: "сен, 16",
                                    y: 19781,
                                    drilldown: "expense_2016_09"
                                },
                                {
                                    name: "окт, 16",
                                    y: 29056,
                                    drilldown: "expense_2016_10"
                                },
                                {
                                    name: "нояб, 16",
                                    y: 19733,
                                    drilldown: "expense_2016_11"
                                },
                                {
                                    name: "дек, 16",
                                    y: 10331,
                                    drilldown: "expense_2016_12"
                                },
                            ]
                        }],
                    });
                //})
            }
        };
    })
