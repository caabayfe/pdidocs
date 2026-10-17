angular.module("sn.chg_soc.landing")
.directive("snLandingCard", function(getTemplateUrl, $window) {
	"use strict";
	return {
		replace : true,
		restrict : "E",
		templateUrl : getTemplateUrl("sn_chg_soc_landing_card.xml"),
		link: function($scope) {
			$scope.openSchedule = function(id, $event) {
				$window.location.href = "/sn_chg_soc_change_soc.do?sysparm_id=" + id + "&sysparm_redirect=" + encodeURIComponent("sn_chg_soc_landing.do");
			};
		},
		controller: function($scope) {
			$scope.hasOwner = function(schedule) {
				if (schedule.owner.value)
					return true;
				return false;
			};
			$scope.isOwner = function(schedule) {
				if (!schedule.owner.value)
					return false;
				return ($window.NOW.user_id === schedule.owner.value);
			};
		}
	};
});
