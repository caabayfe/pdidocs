(function($) {
    'user strict';
    var app = angular.module("sn.clone_request.calendar_view", [
        'ui.bootstrap',
        'ui.bootstrap.popover',
        'sn.common',
        'sn.itsm.vcab.common',
        'sn.itsm.vcab.calendar',
        'sn.itsm.common.accessibility'

    ]);

    function appendStyle() {
        $("#calendar_height").remove();
        var height = $(window).height() - 79; // css was set for min and max height for header height (46px) + legend bar height (33px)
        var s = '<style id="calendar_height"> .sn-calendar .snc-common-calendar { height: ' + (height) + 'px !important; } </style>';
        $(s).appendTo(document.body);
    }

    $("#calendar_height").remove();
    var height = $(window).height() - 79; // css was set for min and max height for header height (46px) + legend bar height (33px)
    var s = '<style id="calendar_height"> .sn-calendar .snc-common-calendar { height: ' + (height) + 'px !important; } </style>';
    $(s).appendTo(document.body);
    app.constant("CAB", {
        FOCUS_TO_CHANGE_TAB: 'cab_change_tab:focus'
    });
    var changeRequestViewApp = app;

    changeRequestViewApp.controller("calendarController",
        function($scope, $log, $rootScope, $timeout, CloneData, isMobile, CAB, isAccessibilityEnabled, vcabDataSource, $window) {
            var c = this;
            c.isA11yEnabled = isAccessibilityEnabled();
            c.isUrlFetching = false;
            c.configOptions = {};
            c.keyNav = true;
            c.onWarn = function(msg) {
				$log.warn(msg);
            };
            var dataSource = vcabDataSource;
            var data2 = JSON.parse(CloneData);
            if (!data2.isValidRecord) {
                $log.error("Invalid Target Record value is" + data2.isValidRecord);
				return;
            }

            c.data = {
                allowConfig: true,
                canRead: data2.canRead,
                canWrite: data2.canWrite,
                timeFormat: data2.timeFormat,
                dateTimeFormat: data2.dateTimeFormat,
                isMobile: false,
                fieldPermission: {
                    start_date: data2.start_date,
                    end_date: data2.end_date
                },
                instanceId: data2.instanceId,
                instanceName: data2.instanceName
            };

            var inputs = {
                instanceId: {
                    "display_value": data2.targetInstanceId,
                    "value": data2.targetInstanceId
                },
                start_date: {

                    "display_value": data2.start_date,
                    "value": data2.start_date
                },
                end_date: {
                    "display_value": data2.end_date,
                    "value": data2.end_date
                }
            };
            c.change = inputs;
            var mobile = false;
            $rootScope.$on(CAB.FOCUS_TO_CHANGE_TAB, function() {
                setTimeout(function() {
                    $('#nav_form').focus();
                }, 10);
            });
        }

    );

})(jQuery);
