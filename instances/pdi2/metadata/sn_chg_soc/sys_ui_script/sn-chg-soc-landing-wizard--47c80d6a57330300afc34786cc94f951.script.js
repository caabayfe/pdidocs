/* Module for creating a new change schedule */
angular.module("sn.chg_soc.landing_wizard",
		[
			"ui.bootstrap",
			"sn.filter_widget",
			"sn.app_itsm.now.accessibility"
		])
.constant("WIZARD_CONST", {
	"CHG_CREATE"      : "/api/sn_chg_soc/soc/createchangeschedule",
	"CHG_GET_FIELDS"  : "/api/sn_chg_soc/soc/gettablefields"
})
.directive("snLandingWizard", function(i18n, getTemplateUrl, $uibModal, $window, WizardService) {
"use strict";
	return {
		replace : true,
		restrict : "E",
		scope: {
			label: "@"
		},
		templateUrl: function(tElement, tAttrs) {
			if (!tAttrs.template)
				return getTemplateUrl("sn_chg_soc_landing_wizard.xml");
			return getTemplateUrl(tAttrs.template);
		},
		link: function($scope, $element, $attrs) {
			if (!$scope.label)
				$scope.label = i18n.getMessage("New");

			$scope.showNew = function() {
				if ($window.NOW.soc_schedules.canCreate)
					return $window.NOW.soc_schedules.canCreate;
				return false;
			};

			$scope.openWizard = function(source) {
				$scope.$emit("sn.change_soc_wizard:opened");
				WizardService.setSource(source);
				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: getTemplateUrl("sn_chg_soc_landing_wizard_template.xml"),
					controller: "WizardModalCtrl",
					ariaLabelledBy: "new-change-schedule",
					size: "lg"
				});
			};
		}
	};
})
.controller("WizardModalCtrl", ["$window", "i18n", "$scope", "$uibModalInstance", "WizardService", "$timeout", "socNotification",
function ($window, i18n, $scope, $uibModalInstance, WizardService, $timeout, socNotification) {
	$scope.data = {};
	$scope.data.name = "";
	$scope.currentPage = "init";
	$scope.isInitPage = function() {
		return $scope.currentPage === "init";
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss("cancel");
	};

	$scope.submit = function() {
		$scope.data.start_date_field = $scope.selectedStart;
		$scope.data.end_date_field = $scope.selectedEnd;
		$scope.data.condition = $scope.condition;
		$scope.data.blackout = $scope.blackout;
		$scope.data.maintenance = $scope.maintenance;
		WizardService.createChangeSchedule($scope.data).then(function(sys_id) {
			if (sys_id && sys_id !== -1) {
				WizardService.trackEvent();
				$window.location.href = "/sn_chg_soc_change_soc.do?sysparm_id=" + sys_id + "&sysparm_redirect=" + encodeURIComponent("sn_chg_soc_landing.do");
			}
		})
		.catch(function(response) {
			if (response.status === 401)
				$window.location.reload();
			socNotification.show("error", response.data.error.message, 0, null, ".soc-condition-builder-modal-message");
		});
	};

	$scope.next = function() {
		$scope.currentPage = "condition";
		$timeout(function() {
			angular.element(".soc-wizard-back").focus();
		}, 0);
	};

	$scope.back = function() {
		$scope.currentPage = "init";
		$timeout(function() {
			angular.element("#name").focus();
		}, 0);
	};

	$scope.messages = {
		"Back" : i18n.getMessage("Back"),
		"Next" : i18n.getMessage("Next"),
		"Submit" : i18n.getMessage("Submit"),
		"Cancel" : i18n.getMessage("Cancel"),
		"Close" : i18n.getMessage("Close"),
		"Create New Change Schedule" : i18n.getMessage("Create New Change Schedule"),
		"Name" : i18n.getMessage("Name"),
		"Start date field" : i18n.getMessage("Start date field"),
		"End date field" : i18n.getMessage("End date field"),
		"Conditions" : i18n.getMessage("Conditions")
	};
}])
.directive("snLandingWizardInitPage", function($window, $timeout, getTemplateUrl, WizardService) {
	"use strict";
	return {
		replace : true,
		restrict : "E",
		templateUrl : getTemplateUrl("sn_chg_soc_landing_wizard_template_init_page.xml"),
		link: function($scope) {
			$scope.startDateFields = [];
			$scope.endDateFields = [];
			$scope.blackout = true;
			$scope.maintenance = true;

			function init() {
				WizardService.getDateTypeFields().then(function(result) {
					result.forEach(function(field, index) {
						var fieldObject = {"columnName" : field.columnName, "label": field.label};
						$scope.startDateFields.push(fieldObject);
						$scope.endDateFields.push(fieldObject);
					});
					$scope.selectedStart = "start_date";
					$scope.selectedEnd = "end_date";
				})
				.catch(function(response) {
					if (response.status === 401)
						$window.location.reload();
				});
			}

			init();

			$timeout(function() {
				angular.element("#name").focus();
			}, 0);
		}
	};
})
.directive("snLandingWizardConditionPage", function(getTemplateUrl) {
	"use strict";
	return {
		replace : true,
		restrict : "E",
		templateUrl : getTemplateUrl("sn_chg_soc_landing_wizard_template_condition_page.xml"),
		controller: function($scope) {
			$scope.table = "change_request";
			$scope.filterConfig = {
				dotWalking	: false,
				testFilter  : false,
				closeFilter : false,
				runFilter   : false,
				saveFilter  : false,
				loadFilter  : false,
				sortFilter  : true,
				clearFilter : false,
				outputType  : "encoded_query",
				encodedQuery: "active=true"
			};

			$scope.condition = "active=true";

			$scope.$on("snfilter:update_query", function(currentScope, queryString) {
				$scope.condition = queryString;
				if (queryString === "^ORDERBYundefined")
					$scope.condition = "";
			});
		}
	};
})
.service("WizardService", ["$rootScope", "$window", "$http", "$q", "WIZARD_CONST",
function($rootScope, $window, $http, $q, WIZARD_CONST) {
	"use strict";
	var wizardService = this;
	wizardService.source = "";

	wizardService.sortArray = function(arr) {
		arr.sort(function(a, b) {
			if (a.label < b.label)
					return -1;
			if (a.label > b.label)
					return 1;
			return 0;
		});
		return arr;
	};

	wizardService.getDateTypeFields = function() {
		var deferred = $q.defer();
		var url = WIZARD_CONST.CHG_GET_FIELDS + "?sysparm_ck=" + $window.g_ck + "&type=date";
		$http.get(url).then(function(response) {
				deferred.resolve(wizardService.sortArray(response.data.result));
		}, function(response) {
				deferred.reject(response);
		});
		return deferred.promise;
	};

	wizardService.createChangeSchedule = function(data) {
		var deferred = $q.defer();
		var url = WIZARD_CONST.CHG_CREATE + "?sysparm_ck=" + $window.g_ck;
		$http.post(url, data).then(function(response) {
				deferred.resolve(response.data.result);
		}, function(response) {
				deferred.reject(response);
		});
		return deferred.promise;
	};

	wizardService.setSource = function(source) {
		wizardService.source = source;
	};

	wizardService.getSource = function() {
		return wizardService.source;
	};

	wizardService.trackEvent = function() {
		if ($window.GlideWebAnalytics && $window.GlideWebAnalytics.trackEvent)
			$window.GlideWebAnalytics.trackEvent('com.snc.change_management.soc','Change Schedules', wizardService.getSource(), 0, 0);
		wizardService.setSource(""); // Reset source
	};
}]);
