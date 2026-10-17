api.controller=function($scope, $rootScope, $timeout, $http, $sce, spUtil, aisaUtils, aisaSearch, aisaAction, aisaFeedback, i18n) {
	var c = this;

	if (!c.data.useAISA) 
		$('#ai_search_assist').css('display', 'none');
	
	var ARIA_MSG_GAP = 1000;
	var ariaMsgs = c.data.ariaMsgs;
	var REQUESTED_FIELDS = {
		"kb_knowledge": ["sys_class_name", "number", "short_description", "description", "sys_view_count", "kb_knowledge_base", "kb_category", "author", "published", "text", "rating", "display_attachments","sys_updated_on"],
		"sc_cat_item": ["sys_class_name", "name", "short_description", "description", "category", "picture"]
	};

	$scope.i18n = i18n;
	$scope.i18nMsgs = c.data.i18nMsgs;
	$scope.getResultField = aisaUtils.getResultField;

	if (c.data.rpConfig) {
		$scope.HEADER_TEXT = c.data.rpConfig.headerText;
		$scope.ALLOW_EXPAND_COLLAPSE = c.data.rpConfig.allowExpandCollapse;
		$scope.RESULTS_PER_PAGE = c.data.rpConfig.resultsPerPage;
		var searchField = $scope.page.g_form.getField("IO:" + c.data.rpConfig.searchVariable);
		$scope.trigger = {
			field: searchField,
			element: document.getElementById('sp_formfield_'+searchField.name)
		};
	}

	$scope.initializeWidget = function() {
		if (window.GlideSignals)
			initializeGlideSignals();
		else {
			$rootScope.$on("sp.defer_scripts.loaded", function(){
				if (window.GlideSignals)
					initializeGlideSignals();
			});
		}

		if (!c.data.isLocationTrackerDisabled) {
			setUserLocationCoords(function(coords) {
				c.latitude = coords.latitude;
				c.longitude = coords.longitude;
			});
		}
		/**
		 * searchResponsePending: set to true everytime a request is submitted, and false when response is received
		 * @type {boolean}
		 */
		$scope.searchResponsePending = false;
		/**
		 * Stores the delayed search term when search response is pending.
		 * And will be used to trigger a search when response returns
		 * @type {string}
		 */
		$scope.delayedSearchTerm = null;
		$scope.resetWidgetForEmptySearch();
		/**
		 * object for holding mapping from result sys id to a list of action objects
		 * Value updated everytime search returns: searchSuccessHandler
		 * @type {object}
		 */
		$scope.actionMap = {};
	};

	function initializeGlideSignals() {
		if (!c.data.isLocationTrackerDisabled && window.GlideSignals.init) {
			window.GlideSignals.init();
		}

		if (window.GlideSignals.trackEvent)
			c.isGlideSignalsLoaded = true;

		$rootScope.GlideSignals = GlideSignals;
	}

	function setUserLocationCoords(cb) {
		var onSuccess = function(pos) {
			return cb({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude
			});
		};
		var onError = function() {
			return cb({
				latitude: null,
				longitude: null	
			});
		};
		return window.navigator.geolocation.getCurrentPosition(onSuccess, onError, {
			enableHighAccuracy: true
		});
	}

	$scope.resetWidgetForEmptySearch = function() {
		$scope.resultsPageIndex = -1;
		$scope.detailResultIndex = -1;
		$scope.isContainerCollapsed = false;
	};

	$scope.initializeWidget();

	/**
	 * Construct and submit a search request
	 * @param {string} newValue the search term
	 */
	function search(trimmedNewValue) {
		$scope.setAriaStatus(i18n.format(ariaMsgs.searching, trimmedNewValue), 0);

		var searchRequest = aisaSearch.newSearchRequest({
			searchApp: c.data.rpConfig.searchApp,
			searchTerm: trimmedNewValue,
			requestedFields: REQUESTED_FIELDS,
			rpSysId: c.data.rpSysId
		});

		$scope.searchResponsePending = true;
		// Submit search request and handle results returned from promise
		searchRequest.submit().then(searchSuccessHandler, searchFailureHandler);
	}
	/**
	 * construct a map from result sysId to list of actions.
	 * resultsActionsMap and availableActions are part of search response
	 *
	 * @param {object} resultsActionsMap: in shape of {resultSysId: [actionSysId]}
	 * @param {object} availableActions: in shape of {actionSysId: {actionObj}}
	 *
	 * @return {object} actionMap: in shape of {resultSysId: [{action object}]}
	 */
	function getResultActions(resultsActionsMap, availableActions) {
		var resultActions = {};
		for (var result in resultsActionsMap) {
			resultActions[result] = [];
			for (var i in resultsActionsMap[result]) {
				var actionSysId = resultsActionsMap[result][i];
				if (!availableActions[actionSysId])
					continue;
				resultActions[result].push(availableActions[actionSysId]);
			}
		}
		return resultActions;
	}

	function searchSuccessHandler(response) {
		$scope.searchResponsePending = false;
		$scope.searchAPIResponse = response.search;
		var searchResults = $scope.searchAPIResponse.searchResults;
		if (searchResults && searchResults.length > 0) {
			var resultCount = searchResults.length || '';
			if ($scope.hasMoreResults())
				$scope.setAriaStatus(i18n.format(ariaMsgs.searchCompleted, resultCount, $scope.trigger.field.label), ARIA_MSG_GAP);
			else
				$scope.setAriaStatus(i18n.format(ariaMsgs.allResultsLoaded, resultCount), ARIA_MSG_GAP);
		} else
			$scope.setAriaStatus(i18n.format(ariaMsgs.noMatchingResults, response.search.term), ARIA_MSG_GAP);
		$scope.resultsPageIndex = 0;
		$scope.actionMap = getResultActions(response.resultsActionsMap, response.availableActions);
		aisaFeedback.searchEvent($scope.searchAPIResponse.term, c.data.rpConfig, $scope.searchAPIResponse.searchResults, c.data.session);
		aisaFeedback.sendSearchAppSeeEvent($scope.searchAPIResponse.term, c.data.rpSysId, $scope.searchAPIResponse.responseTimeInMs, c.data.session.domain);

		if ($scope.delayedSearchTerm)
			searchUponTriggerValueChange($scope.delayedSearchTerm, null);
	}

	function searchFailureHandler(response) {
		$scope.searchResponsePending = false;
	}

	/**
	 * Event handler for field value change, and triggers a debounced search
	 * @param {string} newValue
	 * @param {string} oldValue
	 */
	function searchUponTriggerValueChange(newValue, oldValue) {
		preSearchValidation(newValue, false);
	}

	function preSearchValidation(newValue, forceImmediateSearch) {
		$scope.delayedSearchTerm = null;
		if ($scope.trigger.timeout)
			$timeout.cancel($scope.trigger.timeout);

		if (!newValue) {
			$scope.resetWidgetForEmptySearch();
			return;
		}

		var trimmedNewValue = newValue.trim();
		var charLength = trimmedNewValue.replace(/\s/g,'').length;
		if (!trimmedNewValue || charLength < c.data.aisaProperties.min_length) {
			$scope.resetWidgetForEmptySearch();
			$scope.setAriaStatus(ariaMsgs.noResultsToDisplay, 0);
			return;
		}

		if ($scope.searchAPIResponse && $scope.searchAPIResponse.term === trimmedNewValue) {
			$scope.resultsPageIndex = 0;
			return;
		}

		if (forceImmediateSearch){
			search(trimmedNewValue);
			return;
		}

		if ($scope.searchResponsePending) {
			$scope.delayedSearchTerm = trimmedNewValue;
			return;
		}
		if (c.data.aisaProperties.wait_time >= 0)
			$scope.trigger.timeout = $timeout(search, c.data.aisaProperties.wait_time, true, trimmedNewValue);
	}
	
	if (c.data.useAISA && $scope.trigger) {
		$scope.$watch("trigger.field.stagedValue", searchUponTriggerValueChange);
		if ($scope.trigger.element)
			$scope.trigger.element.addEventListener('blur', function(event) {
				preSearchValidation($scope.trigger.field.stagedValue, true);
			});
	}

	$scope.execAction = function(action, resultRecord, index) {
		var commonFeedbackData = aisaFeedback.getCommonEventData($scope.searchAPIResponse.term, c.data.rpConfig);
		aisaAction.execAction(action, resultRecord, commonFeedbackData, null, null, c.data.session.domain, c.data.rpSysId, index + 1);
	};

	$scope.toggleContainer = function() {
		$scope.isContainerCollapsed = !$scope.isContainerCollapsed;
	};

	$scope.getResultTemplate = function(result) {
		if (!result)
			return null;

		return (result.table) ? "aisa-result-" + result.table : "aisa-result-default";
	};

	$scope.getLocaleDateString = function(input) {
		return new Date(input).toLocaleDateString();
	};

	$scope.getRatingDesc = function(rating) {
		rating = $scope.getRating(rating);
		if (rating == 0)
			return $scope.i18nMsgs.NO_RATING;

		return i18n.format(c.data.i18nMsgs.RATING, $scope.getRating(rating));
	};

	$scope.getRating = function(rating) {
		return Math.round(rating || 0);
	};

	$scope.getResultsLimit = function() {
		if ($scope.resultsPageIndex < 0)
			return -1;

		return (1 + $scope.resultsPageIndex) * $scope.RESULTS_PER_PAGE;
	};

	$scope.hasMoreResults = function() {
		if ($scope.resultsPageIndex < 0)
			return false;
		
		if (!$scope.searchAPIResponse.searchResults)
			return false;
		
		return $scope.searchAPIResponse.searchResults.length > $scope.getResultsLimit();
	};

	$scope.getMoreResults = function() {
		$scope.resultsPageIndex ++;
		$scope.setAriaStatus(ariaMsgs.loadingMoreResults, 0);
	};

	$scope.displayDetail = function(index, event) {
		if (event) {
			if (event.metaKey || event.ctrlKey)
				return;
			event.preventDefault();
		}

		$scope.detailResult = $scope.searchAPIResponse.searchResults[index];
		if (!$scope.detailResult)
			return;

		if ($scope.detailResult._record) {
			$scope.detailResultIndex = index;
			aisaFeedback.searchResultEvent($scope.searchAPIResponse.term, c.data.rpConfig, $scope.detailResult, aisaFeedback.SEARCH_RESULT_EVENT_CLICK, index + 1);
			aisaFeedback.sendActionClickAppSeeEvent($scope.detailResult, c.data.rpSysId, {actionId: "aisa_preview"} , c.data.session.domain, index + 1);
			return;
		}
		
		if ($scope.detailResult.table === 'sc_cat_item') {
			$http.get("/api/sn_sc/servicecatalog/items/" + $scope.detailResult.sysId).then(
				function(response) {
					$scope.detailResult._record = response.data.result;
					$scope.detailResultIndex = index;
					aisaFeedback.searchResultEvent($scope.searchAPIResponse.term, c.data.rpConfig, $scope.detailResult, aisaFeedback.SEARCH_RESULT_EVENT_CLICK, index + 1);
					aisaFeedback.sendActionClickAppSeeEvent($scope.detailResult, c.data.rpSysId, {actionId: "aisa_preview"} , c.data.session.domain, index + 1);
				},
				function(response) {
					// error handler
				}
			);
		} else {
			$http.get("/api/now/table/" + $scope.detailResult.table + "?sysparm_display_value=all&sysparm_query=sys_id%3D" + $scope.detailResult.sysId).then(
				function(response) {
					$scope.detailResult._record = response.data.result[0];
					$scope.detailResultIndex = index;
					if($scope.detailResult.table == 'kb_knowledge' && $scope.detailResult._record.text){
						c.server.get({'action': "get_article_content","articleId":$scope.detailResult.sysId}).then(function(resp){
							$scope.detailResult._record.text.display_value = resp.data.knowledge_content;
						});
						c.server.get({'action': "register_kb_view","articleId":$scope.detailResult.sysId});
					}
					aisaFeedback.searchResultEvent($scope.searchAPIResponse.term, c.data.rpConfig, $scope.detailResult, aisaFeedback.SEARCH_RESULT_EVENT_CLICK, index + 1);
					aisaFeedback.sendActionClickAppSeeEvent($scope.detailResult, c.data.rpSysId, {actionId: "aisa_preview"} , c.data.session.domain, index + 1);
				},
				function(response) {
					// error handler
				}
			);
		}
	};
	
	if (c.data.useAISA) {
		$scope.$on("$sp.sc_cat_item.rp_submitted", function() {
			if (!$scope.searchAPIResponse)
				return;

			aisaFeedback.sendRPSubmitAppSeeEvent($scope.searchAPIResponse.term, c.data.rpSysId, c.data.session.domain);
		});
	}

	$scope.getDetailTemplate = function() {
		var result = $scope.searchAPIResponse.searchResults[$scope.detailResultIndex];
		if (!result)
			return null;

		return result.table ? "aisa-detail-" + result.table : "aisa-detail-default";
	};

	$scope.backToResults = function() {
		$scope.detailResultIndex = -1;
	};

	$scope.detailResultNext = function() {
		if (!$scope.detailResultHasNext())
			return;

		aisaFeedback.sendNavClickAppSeeEvent(aisaFeedback.NAV_NEXT, c.data.rpSysId, c.data.session.domain);
		$scope.displayDetail(++$scope.detailResultIndex);

		if ($scope.detailResultIndex >= $scope.getResultsLimit())
			$scope.getMoreResults();
	};

	$scope.detailResultPrev = function() {
		if (!$scope.detailResultHasPrev())
			return;

		aisaFeedback.sendNavClickAppSeeEvent(aisaFeedback.NAV_PREV, c.data.rpSysId, c.data.session.domain);
		$scope.displayDetail(--$scope.detailResultIndex);
	};

	$scope.detailResultHasNext = function() {
		if (!$scope.searchAPIResponse || !$scope.searchAPIResponse.searchResults || $scope.detailResultIndex < 0)
			return false;

		return $scope.detailResultIndex < $scope.searchAPIResponse.searchResults.length - 1;
	};

	$scope.detailResultHasPrev = function() {
		return $scope.detailResultIndex > 0;
	};

	$scope.sceTrust = function(html) {
		return $sce.trustAsHtml(html);
	};

	$scope.checkResultType = function(result) {
		if (!result || !REQUESTED_FIELDS.hasOwnProperty(result.table))
			return false;

		return true;
	};

	$scope.getSpLink = function(result) {
		if(!result || !result.table || !result.sysId)
			return '#';
		else if(result.table === 'kb_knowledge')
			return '?id=kb_article&sys_id=' + result.sysId;
		else if (result.table === 'sc_cat_item')
			return '?id=sc_cat_item&sys_id=' + result.sysId;
		return '#';
	};
};
