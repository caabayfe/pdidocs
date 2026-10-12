function($scope, $rootScope, $timeout, $http, modelUtil, contextualSearch, contextualFeedback, $log, i18n, spUtil, $sce) {
	var c = this;

	if (c.data.useAISA) 
		$('#contextual_search_results').css('display', 'none');

	var ARIA_MSG_GAP = 1000;
	var PREVIEW_STR = "Preview";
	$scope.i18n = i18n;
	c.data.cxs.RESULT_TITLE_ID = 'result_title_';
	var ariaMsgs = c.data.ariaMsgs;
	$scope.cxs = c.data.cxs;
	var cxs = $scope.cxs;  // local pointer to simplify code
	
	if (cxs.config && cxs.config.search_variable) {
		cxs.trigger = {
			field: $scope.page.g_form.getField("IO:" + cxs.config.search_variable.value)
		};
	}

	/**
	 * Everytime a request is submitted, the search text stored as previousSearchTerm
	 * @type {string}
	 */
	cxs.previousSearchTerm = null;
	cxs.delayedSearch = {
		/**
		 * searchResponsePending: set to true everytime a request is submitted, and false when response is received
		 * @type {boolean}
		 */
		searchResponsePending: false,
		/**
		 * Stores the delayed search term when search response is pending.
		 * And will be used to trigger a search when response returns
		 * @type {string}
		 */
		delayedSearchTerm: null
	}
	cxs.display = {
		collapsed: false
	};

	function clearDisplay() {
		delete(cxs.display.results);
		delete(cxs.display.result_detail);
		delete(cxs.display.result_index);
		delete(cxs.display.result);
	}

	$scope.getRatingDesc = function(rating) {
		rating = $scope.getRating(rating);
		if(rating == 0)
			return c.data.i18nMsgs.noRating;
		return i18n.format(c.data.i18nMsgs.rating, $scope.getRating(rating));
	}

	$scope.getRating = function(rating) {
		return Math.round(rating || 0);
	}

	function hasResults(){
		return cxs.display.results && cxs.display.results.length != 0;
	}
	/**
	 * Construct and submit a search request
	 * @param {string} newValue the search term
	 */
	function startSearch(newValue, formValue) {
		if (cxs.trigger.timeout)
			$timeout.cancel(cxs.trigger.timeout);
		if (newValue === cxs.previousSearchTerm)
			return;
		if (!cxs.trigger.field.value || cxs.trigger.field.value !== formValue)
			$scope.page.g_form.setValue(cxs.trigger.field.name, formValue);
		$scope.setAriaStatus(i18n.format(ariaMsgs.searching, newValue), 0);
		var searchRequest = contextualSearch.newSearchRequest({
			context: cxs.config.cxs_context_config.value,
			query: {
				freetext: newValue,
				/*
						Passing the knowledge base list with the request as search parameter,
						so that knowledge articles will be filtered based on this list. 
						Also passing the catalog list as search parameter to filter catalog items.
					*/
				searchParameters: {
					knowledgeBase: cxs.knowledgeBase,
					catalog: cxs.catalog
				}
			},
			meta: {
				limit: cxs.config.limit.value,
				window: {
					start: 0,
					end: cxs.config.results_per_page.value
				},
				session: cxs.session,
				includePinnedArticles: true
			},
			g_form: $scope.page.g_form
		});

		// Submit search request and handle results returned from promise
		searchRequest.submit().then(
			function(response) {
				clearDisplay();
				cxs.response = response;
				cxs.display.results = response.results;
				cxs.tsQueryId = response.meta.tsQueryId;
				if(hasResults()) {
					var resultCount = response.results.length || '';
					if($scope.hasMoreResults())
						$scope.setAriaStatus(i18n.format(ariaMsgs.searchCompleted, resultCount, cxs.config.search_variable.display_value), ARIA_MSG_GAP);
					else
						$scope.setAriaStatus(i18n.format(ariaMsgs.allResultsLoaded, resultCount), ARIA_MSG_GAP);
				}
				else
					$scope.setAriaStatus(i18n.format(ariaMsgs.noMatchingResults, newValue), ARIA_MSG_GAP);

				if (cxs.delayedSearch.searchResponsePending) {
					cxs.delayedSearch.searchResponsePending = false;
					if (cxs.delayedSearch.delayedSearchTerm !== null && cxs.delayedSearch.delayedSearchTerm !== cxs.previousSearchTerm)
						searchUponTriggerValueChange(cxs.delayedSearch.delayedSearchTerm);
					cxs.delayedSearch.delayedSearchTerm = null;
				}
			},
			function(response) {
				clearDisplay();
				delete(cxs.response);
			}
		);
		cxs.previousSearchTerm = newValue;
		cxs.delayedSearch.searchResponsePending = true;
	}
	/**
	 * Event handler for field value change, and attempts to trigger a debounced search
	 * @param {string} newValue
	 * @param {string} oldValue
	 */
	function searchUponTriggerValueChange(newValue, oldValue) {
		preSearchValidation(newValue, false);
	}

	/**
	 * Triggers a immediate/debounced search
	 * @param {string} newValue
	 * @param {boolean} forceImmediateSearch
	 */
	function preSearchValidation(newValue, forceImmediateSearch) {
		if (cxs.trigger.timeout)
			$timeout.cancel(cxs.trigger.timeout);

		var trimmedNewValue = newValue.trim();
		var charLen = newValue.replace(/\s/g, '').length;
		if (!trimmedNewValue || charLen < cxs.property.min_length) {
			clearDisplay();
			delete(cxs.response);
			$scope.setAriaStatus(ariaMsgs.noResultsToDisplay, 0);
			cxs.previousSearchTerm = trimmedNewValue;
			return;
		}

		if (forceImmediateSearch){
			startSearch(trimmedNewValue, newValue);
			return;
		}

		if (cxs.delayedSearch.searchResponsePending) {
			cxs.delayedSearch.delayedSearchTerm = trimmedNewValue;
			return;
		}

		if (cxs.property.wait_time >= 0)
			cxs.trigger.timeout = $timeout(startSearch, cxs.property.wait_time, true, trimmedNewValue, newValue);
	}

	if (!c.data.useAISA && cxs.trigger) {
		$scope.$watch("cxs.trigger.field.stagedValue", searchUponTriggerValueChange);
		var el = document.getElementById('sp_formfield_' + cxs.trigger.field.name);
		if (el)
			el.addEventListener('blur', function(event) {
				preSearchValidation(cxs.trigger.field.stagedValue, true);
			});
	}

	$scope.getMoreResults = function() {
		if (!$scope.hasMoreResults())
			return;
		// Set limit if request_next exceeds it.
		if (cxs.response.request_next.meta.window.end > cxs.config.limit.value)
			cxs.response.request_next.meta.window.end = cxs.config.limit.value;
		$scope.setAriaStatus(ariaMsgs.loadingMoreResults, 0);
		cxs.response.request_next.submit().then(
			function(response) {
				cxs.response = response;
				cxs.display.results = cxs.display.results.concat(response.results);
				if($scope.hasMoreResults())
					$scope.setAriaStatus(ariaMsgs.resultsLoaded, ARIA_MSG_GAP);
				else
					$scope.setAriaStatus(i18n.format(ariaMsgs.allResultsLoaded, cxs.display.results.length), ARIA_MSG_GAP);

				//Search results' HTML elmeents are not rendered yet, set focus after rendering completes
				$timeout(function(response) {
					var firstResultDiv = document.getElementById(cxs.response.results[0].id)
					if (!firstResultDiv)
						return;

					var aElement = firstResultDiv.querySelector('a');
					if (aElement)
						aElement.focus();
				},0);
			},
			function(response) {
				$log.info("BAD");
			}
		);
	};
	
	$scope.hasMoreResults = function() {
		return cxs.response.meta.has_more_results
			&& cxs.response.request_next.meta.window.start < cxs.config.limit.value;
	};
	
	$scope.displayDetail = function(resultIndex, event) {
		if (event) {
			if (event.metaKey || event.ctrlKey)
				return;

			event.preventDefault();
		}

		if (!cxs.display.results[resultIndex])
			return;
		
		var result = cxs.display.results[resultIndex];
		if (result._record && !result.disable_cache) {
			cxs.display.result_index = resultIndex;
			cxs.display.result_detail = result._record;
			cxs.display.result = result;
			$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
			return;
		}
		
		// Lookup if we haven't already.
		var id = result.id.split(":");
		if(result.meta.source === "community_blog") {
			spUtil.get("community-content-blog",{sys_id: id[1], "type" : "cxs_view", "read_only" : true, "frameless" : true}).then(function(widgetResponse) {
				result._record = widgetResponse;
				result.disable_cache = true;
				cxs.display.result_index = resultIndex;
				cxs.display.result_detail = result._record;
				cxs.display.result = result;
				cxs.display.result.widget_records = [];
				cxs.display.result.widget_records.push(result._record);
				$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
			});
		}
		else if(result.meta.source === "community_question" || result.meta.source === "community_answer") {
			spUtil.get("community-content-question",{sys_id: id[1], "type" : "cxs_view", "read_only" : true, "frameless" : true}).then(function(widgetResponse) {
				result._record = widgetResponse;
				result.disable_cache = true;
				cxs.display.result_index = resultIndex;
				cxs.display.result_detail = result._record;
				cxs.display.result = result;
				cxs.display.result.widget_records = [];
				cxs.display.result.widget_records.push(result._record);
				$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
			});
		}
		else if(result.meta.source === 'catalog'){
			$http.get("/api/sn_sc/servicecatalog/items/" + id[1]).then(
				function(response) {
					result._record = response.data.result;
					cxs.display.result_index = resultIndex;
					cxs.display.result_detail = result._record;
					cxs.display.result = result;
					$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
				}
			);
		}
		else {
			$http.get("/api/now/table/" + id[0] + "?sysparm_display_value=all&sysparm_query=sys_id%3D" + id[1]).then(
				function(response) {
					result._record = response.data.result[0];
					if((result.meta.source.toLowerCase() == 'knowledge' || result.meta.source.toLowerCase() == 'pinned') && result._record.text){
						c.server.get({'action': "get_article_content","articleId":id[1]}).then(function(resp){
							result._record.text.display_value = resp.data.knowledge_content;
						});
					}
					cxs.display.result_index = resultIndex;
					cxs.display.result_detail = result._record;
					cxs.display.result = result;
					$scope.sendFeedback(PREVIEW_STR,cxs.display.result);
				},
				function(response) {
					$log.info("BAD II");
				}
			);
		}
	};
	
	$scope.toggleExpandCollapse = function() {
		cxs.display.collapsed = !cxs.display.collapsed;
	};
	
	$scope.getResultTemplate = function(result) {
		return (result && result.meta.source) ? "cxs-result-" + result.meta.source.toLowerCase() : "cxs-result-default";
	};
	
	$scope.getDetailTemplate = function() {
		var result = cxs.display.results[cxs.display.result_index];
		return (result && result.meta.source) ? "cxs-detail-" + result.meta.source.toLowerCase() : "cxs-detail-default" ;
	};
	
	$scope.getKBParentCategories = function(result) {
		if (!result)
			return;
		
		var parentCategories = [];
		// copy by value. slice() does not work on this array
		if (result.meta.parentCategories)
			for (var i = 0; i < result.meta.parentCategories.length; i++)
			parentCategories.push(result.meta.parentCategories[i]);
		return parentCategories.reverse().join(' > ');
	};
	
	// Detail navigation
	$scope.backToResults = function() {
		delete(cxs.display.result_detail);
		delete(cxs.display.result_index);
		delete(cxs.display.result);
		$scope.onBackToResult();
	};
	
	$scope.toNext = function() {
		if (cxs.display.result_index >= cxs.display.results.length-1 && $scope.hasMoreResults())
			$scope.getMoreResults();
		
		if ($scope.hasNext())
			$scope.displayDetail(cxs.display.result_index + 1);	
	};
	
	$scope.toPrev = function() {
		if ($scope.hasPrev())
			$scope.displayDetail(cxs.display.result_index - 1);
	};
	
	$scope.hasNext = function() {
		return cxs.display.result_index < cxs.display.results.length-1 || $scope.hasMoreResults();
	};
	
	$scope.hasPrev = function() {
		return cxs.display.result_index > 0;
	};
	
	$scope.sendFeedback = function(actionValue, result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
		var relevance = true;
		var thisHelpedActionDetails = $scope.thisHelpedActionDetails(result);
		if(thisHelpedActionDetails && thisHelpedActionDetails.actionValue === actionValue)
			relevance = !$scope.isRelevant(result);
		var feedbackRequest = contextualFeedback.newFeedbackRequest({
			session: cxs.session,
			search_request: cxs.response.request,
			relevant_doc: result.id,
			relevant_doc_url: result.sp_link || result.link,
			relevance: actionValue,
			relevant: relevance,
			score: result.meta.score,
            index: cxs.display.result_index,
			displayed_on: cxs.displayed_on
		});
		
		feedbackRequest.submit().then(
			function(response) {
				if (!result.meta.relevance)
					result.meta.relevance = {};
				if(thisHelpedActionDetails && thisHelpedActionDetails.actionValue !== actionValue)
					result.meta.relevance[actionValue] = true;
				else {
					var thisHelpedAction = $scope.thisHelpedActionDetails(cxs.display.result);
					// if helped action inactive it will not come in the result
					if(thisHelpedAction != null && thisHelpedAction != '') {
						if(actionValue == thisHelpedAction.actionValue)
							result.meta.relevance[actionValue] = !$scope.isRelevant(result);
					}
				}
			},
			function(response) {
				$log.info("BAD III");
			}
		);

		if(result.meta.source && (result.meta.source.toLowerCase() == 'knowledge' || result.meta.source.toLowerCase() == 'pinned')) {
			var id = result.id.split(":");
			c.server.get({'action': "register_kb_view", "articleId":id[1], "tsQueryId": cxs.tsQueryId}).then(function(resp){
				if (result._record.sys_view_count && resp.data.viewCount) {
					result._record.sys_view_count.display_value = resp.data.viewCount;
					result._record.sys_view_count.value = resp.data.viewCount;
				}
			});
		}
	};
	
	$scope.thisHelpedActionDetails = function(result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
		
		return $scope.parseJson(result.searchResultActions.this_helped);
	};
	
	$scope.orderActionDetails = function(result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
		
		return $scope.parseJson(result.searchResultActions.order);
	};

	$scope.attachActionDetails = function(result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
		
		return $scope.parseJson(result.searchResultActions.attach);
	};

	$scope.cxsTrust = function(html) {
		return $sce.trustAsHtml(html);
	};

	$scope.isRelevant = function(result) {
		if (!result)
			result = cxs.display.results[cxs.display.result_index];
			
		var thisHelpedActionDetails = $scope.thisHelpedActionDetails(result);
		
		var relevancy = result.meta.relevance && thisHelpedActionDetails && result.meta.relevance[thisHelpedActionDetails.actionValue];
		
		if(relevancy)
			return relevancy;
		
		return false;
	};

	$scope.hasValidSpLink = function(result, tableName) {
		if (tableName) {
			if (tableName === 'kb_knowledge')
				return true;
			else if (tableName.includes('communities') && result.link)
				return true;
			else if (tableName === 'kb_social_qa_question')
				return true;
		}
		return result && Array.isArray(result.related_links) && result.related_links[0] && result.related_links[0].sp_link;
	};

	$scope.getSpLink = function(result) {
		if (!result || !result.meta || !result.id)
			return

		var tableName = result.id.split(":")[0];
		var sysId = result.id.split(":")[1];

		if (!$scope.hasValidSpLink(result, tableName))
			return;

		// Knowledge search resource doesn't output a Portal link, so will take the kb sys_id to concatenate a permalink
		if (tableName === 'kb_knowledge')
			return '?id=kb_article&sys_id=' + sysId;

		// Community search resource doesn't output a Portal link, so will take the link
		if (tableName.includes('communities') || result.link.includes('community_cxs'))
			return result.link.substring(result.link.indexOf("?"));

		// Social QA search resource doesn't output a Portal link, so will take the Social QA sys_id to concatenate a permalink
		if (tableName === 'kb_social_qa_question')
			return '?id=kb_social_qa_question&sys_id=' + sysId;

		return result.related_links[0].sp_link + '&referrer=contextual_search';
	};

	$scope.parseJson = function(json) {
		var parsedJSON = '';
		if(json)
			parsedJSON = JSON.parse(json);
		return parsedJSON;
    };
	
	var deregister = $rootScope.$on("$sp.sc_cat_item.submitted", function(event, response){
        contextualFeedback.link(cxs.session, response.table, response.sys_id);
    });
    
    $scope.$on('$destroy', function(){ 
		deregister();
	});

}
