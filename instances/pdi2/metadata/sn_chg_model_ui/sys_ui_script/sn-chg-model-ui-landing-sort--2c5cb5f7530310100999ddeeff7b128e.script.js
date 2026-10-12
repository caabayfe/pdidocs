var app = angular.module("sn.chg_model_ui.landing");
app.directive("snLandingSort", function($window, urlTools, i18n, chgModelService) {
    "use strict";
    return {
      replace : true,
      restrict : "E",
      templateUrl : urlTools.getPartialURL("sn_chg_model_ui_cmu_landing_sort.xml", "v=" + $window.NOW.macro_flush_stamp),
      link: function($scope) {
        $scope.sortOptions = [];
        $scope.sortOptions.push({"label": i18n.getMessage(("Name")), "value": "name"});
        $scope.sortOptions.push({"label": i18n.getMessage(("Most used")), "value": "most_used" });
        $scope.selectedSort = "name";
      },
      controller: function($scope) {
        $scope.messages = {
          "Sort By": i18n.getMessage("Sort by")
        };
        $scope.setFilter = function() {
          chgModelService.sortArray($scope.selectedSort);
        };
      }
    };
});
