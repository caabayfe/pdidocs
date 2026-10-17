(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	if (!request.body || !request.body.data) {
		response.setStatus(400);
		response.setBody({ isError: true, errorMessage: 'Request body or body.data is missing' });
		return response;
	}
	var bodyData = request.body.data;
	var userText = bodyData.userText;
	var filterRequest = bodyData.filterRequest;
	if (!userText) {
		response.setStatus(400);
		response.setBody({ isError: true, errorMessage: 'userText is missing' });
		return response;
	}
	if (!filterRequest) {
		response.setStatus(400);
		response.setBody({ isError: true, errorMessage: 'filterRequest is missing' });
		return response;
	}
	try {
		var allFilters = filterRequest;
		var filtersByAssistant;
		if (!gs.nil(bodyData.assistantId)) {
				filtersByAssistant = sn_one_extend.OneExtendUtil.getSemanticFlowFilters(bodyData.assistantId, "router");
		}

		var filtersToCheck = {
				filterIds: [],
				filterMetadata: {}
		};

		// Merge both filter requests
		filtersToCheck = mergeFilterRequests(filtersToCheck, allFilters);
		filtersToCheck = mergeFilterRequests(filtersToCheck, filtersByAssistant);

		// Step 1: Run semantic search
		var searchResult = new global.GenAISemanticFilterUtil().getSearchResults(userText, JSON.stringify(filtersToCheck));
		var rawResults = typeof searchResult === 'string' ? JSON.parse(searchResult) : searchResult;

		if (!rawResults || rawResults.length === 0) {
			response.setStatus(200);
			response.setBody({ isError: false, result: {} });
			return response;
		}

		// Step 2: Load filter metadata for matched filterIds
		var matchedFilterIds = rawResults.map(function(r) { return r.filterId; });
		var filtersMap = loadFilterMetadata(matchedFilterIds);

		// Step 3: Apply generateResponse logic — mirrors FiltersValidator.generateResponse()
		var result = generateResponse(rawResults, filtersMap);

		response.setStatus(200);
		response.setBody({ isError: false, result: result || {} });
		return response;
	} catch(ex) {
		response.setStatus(500);
		response.setBody({ isError: true, errorMessage: ex.message });
		return response;
	}

	// Helper function to merge filter requests
	function mergeFilterRequests(target, source) {
		if (!source) return target;

		// Merge filterIds (union)
		var idSet = {};
		(target.filterIds || []).forEach(function(id) {
				idSet[id] = true;
		});
		(source.filterIds || []).forEach(function(id) {
				idSet[id] = true;
		});
		target.filterIds = Object.keys(idSet);

		// Merge  filterMetadata
		target.filterMetadata = target.filterMetadata || {};
		if (source.filterMetadata) {
				for (var key in source.filterMetadata) {
						if (!target.filterMetadata[key]) {
								target.filterMetadata[key] = source.filterMetadata[key];
						}
				}
		}

		return target;
	}

	/**
	 * Loads filter_group, filter_group_order, filter_error_topic for a set of filter sys_ids.
	 * Returns a map of filterId -> filter metadata object.
	 */
	function loadFilterMetadata(filterIds) {
		var map = {};
		var gr = new GlideRecord('sys_gen_ai_filter');
		gr.addQuery('sys_id', 'IN', filterIds.join(','));
		gr.query();
		while (gr.next()) {
			var id = gr.getUniqueValue();
			map[id] = {
				filterId: id,
				filterGroup: gr.getValue('filter_group'),
				filterOrder: parseInt(gr.getValue('filter_group_order')) || 0,
				filterErrorTopic: gr.getValue('filter_error_topic')
			};
		}
		return map;
	}

	/**
	 * Mirrors FiltersValidator.generateResponse() / isAllFilterBelongToSameGroup().
	 * Returns { topicId, filterId } for the winning filter, or null if none matched.
	 */
	function generateResponse(searchResults, filtersMap) {
		var matchedFilters = searchResults
			.map(function(r) { return filtersMap[r.filterId]; })
			.filter(Boolean);

		if (matchedFilters.length === 0) return null;

		var firstGroup = matchedFilters[0].filterGroup;
		var allSameGroup = firstGroup && matchedFilters.every(function(f) {
			return f.filterGroup === firstGroup;
		});

		var winner;
		if (allSameGroup) {
			// Same group: pick lowest order
			matchedFilters.sort(function(a, b) { return a.filterOrder - b.filterOrder; });
			winner = matchedFilters[0];
		} else {
			// Different groups: pick highest score
			searchResults.sort(function(a, b) { return b.score - a.score; });
			winner = filtersMap[searchResults[0].filterId];
		}

		if (!winner) return null;
		return { topicId: winner.filterErrorTopic, filterId: winner.filterId };
	}
})(request, response);
