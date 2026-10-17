angular.module("sn.app_common.aisa", ["sn.app_common.aisa.utils", "sn.app_common.aisa.search", "sn.app_common.aisa.action"]);

angular.module("sn.app_common.aisa.feedback", ["sn.app_common"]);
angular.module("sn.app_common.aisa.feedback").service("aisaFeedback", ["$rootScope", "snAnalytics", "i18n", function($rootScope, snAnalytics, i18n) {
	var aisaFeedback = this;

	aisaFeedback.SEARCH_EVENT = 'SEARCH_EVENT';
	aisaFeedback.SEARCH_RESULT_EVENT = 'SEARCH_RESULT_EVENT';
	aisaFeedback.SEARCH_RESULT_EVENT_CLICK = 'CLICK';
	aisaFeedback.NAV_NEXT = 'Next';
	aisaFeedback.NAV_PREV = 'Previous';
	aisaFeedback.DOMAIN = 'Domain';
	
	var cleanTitle = function(title) {
		return title.replace( /(<([^>]+)>)/ig, '');
	};

	aisaFeedback.getCommonEventData = function(searchTerm, rpConfig) {
		var commonData = {
			'searchContextConfigId': rpConfig.searchApp,
			'queryTerm': searchTerm
		};
		return commonData;
	};

	aisaFeedback.searchEvent = function(searchTerm, rpConfig, rawSearchResults, session) {
		var GlideSignals = $rootScope.GlideSignals;
		var feedbackData = aisaFeedback.getCommonEventData(searchTerm, rpConfig);
		var searchResults = [];
		var searchResultsPerSourceObj = {};
		var searchResultsPerSource = [];
		rawSearchResults.forEach(function(searchResult) {
			searchResults.push({
				'tableName': searchResult.table,
				'recordId': searchResult.sysId,
				'resultType': "REGULAR"
			});
			if (!searchResultsPerSourceObj[searchResult.table])
				searchResultsPerSourceObj[searchResult.table] = {
					'sourceId': searchResult.table,
					'numberOfResults': 0
				};
			searchResultsPerSourceObj[searchResult.table].numberOfResults += 1;
		});
		for (var table in searchResultsPerSourceObj)
			searchResultsPerSource.push(searchResultsPerSourceObj[table]);

		feedbackData.userId = session.userId;
		feedbackData.language = session.language;
		feedbackData.searchResults = searchResults;
		feedbackData.searchResultsPerSource = searchResultsPerSource;
		GlideSignals.trackEvent(aisaFeedback.SEARCH_EVENT, GlideSignals.priority.INFO, feedbackData);
	};

	aisaFeedback.searchResultEvent = function(searchTerm, rpConfig, result, signalType, signalValue) {
		var GlideSignals = $rootScope.GlideSignals;
		var feedbackData = aisaFeedback.getCommonEventData(searchTerm, rpConfig);
		feedbackData.resultSysId = result.sysId;
		feedbackData.labelDescription = cleanTitle(result.title);
		feedbackData.sourceTable = result.table;
		feedbackData.aisDocId = result.table + '_' + result.sysId;
		feedbackData.signalType = signalType;
		feedbackData.signalValue = signalValue;
		GlideSignals.trackEvent(aisaFeedback.SEARCH_RESULT_EVENT, GlideSignals.priority.INFO, feedbackData);
	};
	
	aisaFeedback.sendSearchAppSeeEvent = function(searchTerm, rpSysId, responseTime, domain) {
		var payload = {
			SearchTerm: searchTerm,
			ResponseTime: responseTime,
			RecordProducer: rpSysId
		};
		if (domain)
			payload[aisaFeedback.DOMAIN] = domain;
		
		aisaFeedback.sendAppSeeEvent({
			name: 'Search Start AI Search Assist',
			data: payload
		});
	};
	
	aisaFeedback.sendSearchCompleteAppSeeEvent = function(resultRecord, rpSysId, link, actionId, domain, position) {
		var payload = {
			ActionID: actionId,
			DataSourceName: resultRecord.table,
			DocumentID: resultRecord.sysId,
			DocumentTitle: cleanTitle(resultRecord.title),
			Link: link,
			RecordProducer: rpSysId
		};
		if (domain)
			payload[aisaFeedback.DOMAIN] = domain;
		if (position)
			payload['ClickPosition'] = position;
		
		aisaFeedback.sendAppSeeEvent({
			name: 'Search Complete AI Search Assist',
			data: payload
		});
	};
	
	aisaFeedback.sendResultClickAppSeeEvent = function(resultRecord, rpSysId, position, domain) {
		var payload = {
			ClickPosition: position,
			DataSourceName: resultRecord.table,
			DocumentID: resultRecord.sysId,
			DocumentTitle: cleanTitle(resultRecord.title),
			RecordProducer: rpSysId
		};
		if (domain)
			payload[aisaFeedback.DOMAIN] = domain;
		
		aisaFeedback.sendAppSeeEvent({
			name: 'Search Result Click AI Search Assist',
			data: payload
		});
	};
	
	aisaFeedback.sendNavClickAppSeeEvent = function(navDirection, rpSysId, domain) {
		var payload = {
			NavigationDirection: navDirection,
			RecordProducer: rpSysId
		};
		if (domain)
			payload[aisaFeedback.DOMAIN] = domain;
		
		aisaFeedback.sendAppSeeEvent({
			name: 'Search Result Navigation Click AI Search Assist',
			data: payload
		});
	};
		
	aisaFeedback.sendActionClickAppSeeEvent = function(resultRecord, rpSysId, actionInfo, domain, position) {
		var payload = {
			ActionID: actionInfo.actionId,
			DataSourceName: resultRecord.table,
			DocumentID: resultRecord.sysId,
			DocumentTitle: cleanTitle(resultRecord.title),
			RecordProducer: rpSysId
		};
		
		if (actionInfo.value)
			payload['ActionValue'] = actionInfo.value;
		if (domain)
			payload[aisaFeedback.DOMAIN] = domain;
		if (position)
			payload['ClickPosition'] = position;
		
		aisaFeedback.sendAppSeeEvent({
			name: 'Search Result Action Click AI Search Assist',
			data: payload
		});
	};
	
	aisaFeedback.sendRPSubmitAppSeeEvent = function(searchTerm, rpSysId, domain) {
		var payload = {
			SearchTerm: searchTerm,
			RecordProducerSysID: rpSysId,
		};
		
		if (domain)
			payload[aisaFeedback.DOMAIN] = domain;
		
		aisaFeedback.sendAppSeeEvent({
			name: 'Record Producer Submit AI Search Assist',
			data: payload
		});
	};
	
	aisaFeedback.sendAppSeeEvent = function(payload) {
		snAnalytics.addEvent(payload);
	};
}]);

angular.module("sn.app_common.aisa.search", ["sn.app_common"]);
angular.module("sn.app_common.aisa.search").service("aisaSearch", ["$http", "$q", "$log", function($http, $q, $log) {
	var aisaSearch = this;

	this.AISA_SEARCH_ENDPOINT = "/api/now/aisa/search";

	// Definition of the client side SearchRequest
	var SearchRequest = function(requestData) {
		var searchRequest = {
			method: 'POST',
			url: aisaSearch.AISA_SEARCH_ENDPOINT,
			headers: {
				'Content-Type': "application/json; charset=UTF-8"
			},
			data: {
					"searchContextConfigId":requestData.searchApp,
					"requestedFields": requestData.requestedFields,
					"searchTerm": requestData.searchTerm,
					"rpSysId": requestData.rpSysId
			}
		};
		// Deep copy of request.  Stops dot walking inadvertantly modifying different requests.
		angular.copy(searchRequest, this);

		this.submit = function() {
			return aisaSearch.submit(this);
		};
	};

	// Definition of the client side SearchResponse
	var SearchResponse = function(responseData) {
		var searchAPIResponse = {};
		try {
			searchAPIResponse = responseData.data.result;
			searchAPIResponse.status = responseData.status;
		} catch (e) {
			searchAPIResponse = {
				status: 500,
				error: "Server Internal Error"
			};
		} finally {
			angular.copy(searchAPIResponse, this);
		}
	};

	aisaSearch.newSearchRequest = function(requestData) {
		return new SearchRequest(requestData);
	};

	aisaSearch.submit = function(searchRequest) {
		var deferred = $q.defer();
		$http(searchRequest).then(
			function(response) {
				deferred.resolve(new SearchResponse(response));
			},
			function(response) {
				deferred.reject(response);
			}
		);
		return deferred.promise;
	};
}]);

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
	
	aisaAction.execAction = function(action, resultRecord, commonFeedbackData, isModalSubmit, modalData, domain, rpSysId, position) {
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
					aisaFeedback.sendSearchCompleteAppSeeEvent(resultRecord, rpSysId, result.linkValue, action.actionId, domain, position);
					$window.open(result.linkValue, '_blank');
				} else if (aisaAction.ACTION_TYPE.OPEN_LINK_CURRENT_TAB === actionType) {
					aisaFeedback.sendSearchCompleteAppSeeEvent(resultRecord, rpSysId, result.linkValue, action.actionId, domain, position);
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
						aisaAction.execAction(this.action, this.result, commonFeedbackData, true, this.modalData, domain, rpSysId, position);
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
					}, domain, position);
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

angular.module("sn.app_common.aisa.utils", ["sn.app_common"]);
angular.module("sn.app_common.aisa.utils").service("aisaUtils", ["$log", function($log) {
	var aisaUtils = this;

	aisaUtils.buildCatalogKBFacetFilters = function(catalogDisplayValues, kbDisplayValues) {
		var catalogValues = [];
		var knowledgeBaseValues = [];
		catalogDisplayValues.forEach(function(e1) {
			if (e1)
				catalogValues.push(e1);
		});
		
		kbDisplayValues.forEach(function(e2) {
			if (e2)
				knowledgeBaseValues.push(e2);
		});
		return ["_sc_cat_item.sc_catalogs_s:FACET(" + catalogValues + ")", "_kb_knowledge.kb_knowledge_base_s:FACET(" + knowledgeBaseValues + ")"];
	};

	aisaUtils.getResultField = function(result, fieldName) {
		var field = {value: '', displayValue: ''};
		if (!result)
			return field;

		result.columns.forEach(function(column) {
			if (column.fieldName === fieldName)
				field = column;
		});
		return field;
	};

}]);
