angular.module("sn.app_common.aisa.action", ["sn.app_common", "sn.app_common.aisa.utils"]);
angular.module("sn.app_common.aisa.action").service("aisaAction", ["$http", "$window", "$location", "$log", "aisaUtils", "aisaActionModalHelper", "aisaFeedback", "i18n", function($http, $window, $location, $log, aisaUtils, aisaActionModalHelper, aisaFeedback, i18n) {
	var aisaAction = this;

	aisaAction.ACTION_ENDPOINT_BASE = '/api/now/aisa_action';
	aisaAction.ACTION_TYPE = {
		'OPEN_LINK_NEW_TAB': 'OPEN_LINK_NEW_TAB',
		'OPEN_LINK_CURRENT_TAB': 'OPEN_LINK_CURRENT_TAB',
		'OPEN_MODAL': 'OPEN_MODAL',
		'REDIRECT': 'REDIRECT',
		'SEARCH_RESULT_EVENT_SIGNAL': 'SEARCH_RESULT_EVENT_SIGNAL',
	};
	aisaAction.ACTIONS = {
		'SOLVES_ISSUE': 'Solves my issue'
	};
	
	aisaAction.execAction = function(action, resultRecord, commonFeedbackData, isModalSubmit, modalData, domain, rpSysId) {
		var table = resultRecord.table;
		var sysId = resultRecord.sysId;

		var className = aisaUtils.getResultField(resultRecord, "sys_class_name").value;
		if (!className)
			className = table;

		var restPath = action.restPath;
		if (!restPath.startsWith('/'))
			restPath = '/' + restPath;

		var actionRequest = {
			method: 'POST',
			url: aisaAction.ACTION_ENDPOINT_BASE + restPath,
			headers: {
				'Content-Type': "application/json; charset=UTF-8"
			},
			data: {
				table: table,
				sysId: sysId,
				className: className,
				commonFeedbackData: commonFeedbackData,
				isModalSubmit: isModalSubmit,
				modalData: modalData
			}
		};

		$http(actionRequest).then(
			function(response) {
				var result = response.data.result;
				var actionType = result.actionType;
				var forceRedirect = result.forceRedirect;
			
				if (aisaAction.ACTION_TYPE.OPEN_LINK_NEW_TAB === actionType) {
					aisaFeedback.sendSearchCompleteAppSeeEvent(resultRecord, rpSysId, result.linkValue, action.actionId, domain);
					$window.open(result.linkValue, '_blank');
				} else if (aisaAction.ACTION_TYPE.OPEN_LINK_CURRENT_TAB === actionType) {
					aisaFeedback.sendSearchCompleteAppSeeEvent(resultRecord, rpSysId, result.linkValue, action.actionId, domain);
					if (forceRedirect) {
						g_dirty_form_warning_enabled = false;
						// using open will do a refresh to reset g_dirty_form_warning_enabled
						$window.open(result.linkValue, '_self');
					} else
						$location.search(result.linkValue);
				} else if (aisaAction.ACTION_TYPE.OPEN_MODAL === actionType) {
					var actionModal = {};
					actionModal.result = resultRecord;
					actionModal.action = action;
					actionModal.title = result.modalTitle || action.actionLabel;
					actionModal.bodyTemplate = result.modalBodyTemplate;
					actionModal.submitText = result.modalSubmitText || i18n.getMessage('Submit');
					actionModal.cancelText = result.modalCancelText || i18n.getMessage('Cancel');
					// modalData is for custom usage of modal
					actionModal.modalData = result.modalData;
					actionModal.modalSubmit = function() {
						aisaAction.execAction(this.action, this.result, commonFeedbackData, true, this.modalData, domain, rpSysId);
					};
					aisaActionModalHelper.showActionModal(actionModal);
				} else if (aisaAction.ACTION_TYPE.SEARCH_RESULT_EVENT_SIGNAL === actionType) {
					var searchTerm = commonFeedbackData.queryTerm;
					var rpConfig = {searchApp: commonFeedbackData.searchContextConfigId};
					var signalType = result.signalType;
					var signalValue = result.signalValue;
					aisaFeedback.searchResultEvent(searchTerm, rpConfig, resultRecord, signalType, signalValue);
					aisaFeedback.sendActionClickAppSeeEvent(resultRecord, rpSysId, {
						actionId: action.actionId,
						actionValue: signalValue
					}, domain);
				}
			},
			function(response) {
				
			}
		);
	};
}]);

angular.module("sn.app_common.aisa.action").factory('aisaActionModalHelper', ["$uibModal", "aisaUtils", function ($uibModal, aisaUtils) {
	"use strict";
	return {
		showActionModal: function (actionModal) {
			var modalInstance = $uibModal.open({
				templateUrl: 'aisa-action-modal',
				controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
					$scope.actionModal = actionModal;
					$scope.aisaUtils = aisaUtils;
					$scope.ok = function() {
						$uibModalInstance.dismiss();
						actionModal.modalSubmit();
					};
					$scope.cancel = function() {
						$uibModalInstance.dismiss();
					};
				}],
				size: 'md'
			});
			return modalInstance;
		}
	};
}]);
