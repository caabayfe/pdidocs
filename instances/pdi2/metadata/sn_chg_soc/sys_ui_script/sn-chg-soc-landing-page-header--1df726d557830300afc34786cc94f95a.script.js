var app = angular.module("sn.chg_soc.landing");
app.directive("snLandingPageHeader", function(getTemplateUrl, i18n) {
    "use strict";
    return {
      replace: true,
      restrict: "E",
      templateUrl: getTemplateUrl("sn_chg_soc_landing_header.xml"),
      link: function($scope) {
        $scope.filter = {
          "placeholderText": i18n.getMessage("Search by name or owner"),
          "filterConditions": ["name.display_value","owner.display_value"]
        };
      }
    };
});
