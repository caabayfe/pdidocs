var app = angular.module("sn.chg_model_ui.landing");
app.directive("snLandingPageHeader", function($window, urlTools, i18n) {
    "use strict";
    return {
        replace: true,
        restrict: "E",
        templateUrl: urlTools.getPartialURL("sn_chg_model_ui_cmu_landing_header.xml", "v=" + $window.NOW.macro_flush_stamp),
        link: function($scope) {
            $scope.filter = {
                "placeholderText": i18n.getMessage("Filter by keyword..."),
                "filterConditions": ["name.display_value", "description.display_value"]
            };
        }
    };
});
