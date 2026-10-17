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
	
	aisaFeedback.sendSearchCompleteAppSeeEvent = function(resultRecord, rpSysId, link, actionId, domain) {
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
		
	aisaFeedback.sendActionClickAppSeeEvent = function(resultRecord, rpSysId, actionInfo, domain) {
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
