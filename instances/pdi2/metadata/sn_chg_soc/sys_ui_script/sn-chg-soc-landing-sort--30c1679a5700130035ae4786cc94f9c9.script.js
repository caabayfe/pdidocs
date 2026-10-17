var app = angular.module("sn.chg_soc.landing");
app.directive("snLandingSort", function(getTemplateUrl, i18n, ScheduleService) {
    "use strict";
    return {
      replace : true,
      restrict : "E",
      templateUrl : getTemplateUrl("sn_chg_soc_landing_sort.xml"),
      link: function($scope) {
        $scope.sortOptions = [];
        $scope.sortOptions.push({"label" : i18n.getMessage(("Schedule Name")), "value" : "name" });
        $scope.sortOptions.push({"label" : i18n.getMessage(("Owner")), "value" : "owner"});
        $scope.selectedSort = "name";
      },
      controller: function($scope) {
        $scope.messages = {
          "Sort By" : i18n.getMessage("Sort by")
        };
        $scope.setFilter = function() {
          ScheduleService.sortArray($scope.selectedSort);
        };
      }
    };
});
