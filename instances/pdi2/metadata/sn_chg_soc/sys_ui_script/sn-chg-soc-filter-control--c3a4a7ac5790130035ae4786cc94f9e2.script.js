/* Module with modal with filter and sort controllers */
angular.module("sn.chg_soc.filter_control", ["ui.bootstrap", "sn.filter_widget"])
.constant("FILTER_CONTROL", {
	TRACKING_KEY: {
		DRY_RUN: "Dry run Change Schedule filter"
	},
	TABLE_NAME: "change_request"
})
.directive("snSocFilterControl", function(i18n, getTemplateUrl, $uibModal) {
	"use strict";
	return {
		replace: true,
		restrict: "E",
		templateUrl: getTemplateUrl("sn_chg_soc_snSocConditionBuilder.xml"),
		link: function($scope, $element, $attrs) {
			$scope.messages = {
				"Filter": i18n.getMessage("Filter")
			};

			$scope.openFilterControl = function() {
				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl: getTemplateUrl("sn_chg_soc_snSocConditionBuilderTemplate.xml"),
					controller: "ModalInstanceCtrl",
					size: "lg"
				});
			};
		},
		controller: function($scope) {
			$scope.$on("isLoading", function(loadingElements) {
				$scope.loadingElements = loadingElements;
			});
		}
	};
})
.controller('ModalInstanceCtrl', ["$window", "i18n", "$scope", "$uibModalInstance", "$timeout", "dataService", "clientService", "urlService", "ganttChart", "socNotification", "FILTER_CONTROL",
function ($window, i18n, $scope, $uibModalInstance, $timeout, dataService, clientService, urlService, ganttChart, socNotification, FILTER_CONTROL) {
	$scope.showFilter = false;
	$scope.table = FILTER_CONTROL.TABLE_NAME;
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
		encodedQuery: clientService.filter.condition.value
	};

	$scope.condition = clientService.filter.condition.value;

	$scope.$on("snfilter:update_query", function(currentScope, queryString) {
		$scope.condition = queryString.replace("^ORDERBYundefined", "");
	});

	$scope.enableRun = function() {
		if (!$scope.condition)
			return false;
		return $scope.condition !== "" && !$scope.condition.startsWith("^ORDERBY");
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss("cancel");
	};

	$scope.run = function() {
		// Retain chgDefId to help recover from dataService.destroyData & REST error
		if (clientService.filter.sys_id && clientService.filter.sys_id.value)
			$scope.chgDefId = clientService.filter.sys_id.value;

		var hasDynamicCondition = false;
		if (!clientService.filter.sys_id || clientService.filter.condition.value !== $scope.condition) {
			var chgDefId = clientService.filter.sys_id && clientService.filter.sys_id.value ? clientService.filter.sys_id.value : $scope.chgDefId;

			// Validate the condition
			dataService.parseQuery($scope.condition).then(function(query) {
				query.parsed_query.forEach(function(terms) {
					if (!hasDynamicCondition && terms.filter(function(term) { return term.operator === "DYNAMIC"; } ).length > 0)
						hasDynamicCondition = true;
				});
			}).then(function() {
				if (hasDynamicCondition)
					socNotification.show("error", i18n.getMessage("is (dynamic) filter operators are not supported"), 0, null, ".soc-condition-builder-modal-message");
				else {
					dataService.destroyData();
					dataService.initPage(chgDefId, $scope.condition).then(function() {
						dataService.trackEvent(FILTER_CONTROL.TRACKING_KEY.DRY_RUN);
						clientService.filter.condition.dryRun = $scope.condition !== clientService.filter.condition.value;
						clientService.filter.condition.value = $scope.condition;
						var tasks = dataService.tasks;
						ganttChart.updateGanttData(urlService.socId, dataService.tasks);
						$uibModalInstance.dismiss("cancel");
					}).catch(function(response) {
						// dataService.destroyData() causes data model to be corrupt if REST called by initPage fails. Page refresh needed
						socNotification.show("error", response.data.error.message, 0, null, ".soc-condition-builder-modal-message");
					});
				}
			});
		} else
			$uibModalInstance.dismiss("cancel");
	};

	$scope.messages = {
		"Run" : i18n.getMessage("Run"),
		"Cancel" : i18n.getMessage("Cancel"),
		"Close" : i18n.getMessage("Close"),
		"Title" : i18n.getMessage("Adjust Schedule Condition"),
	};
}]);
