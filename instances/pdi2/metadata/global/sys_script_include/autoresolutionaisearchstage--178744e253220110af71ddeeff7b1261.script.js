var AutoResolutionAISearchStage = Class.create();
AutoResolutionAISearchStage.prototype = Object.extendsObject(AutoResolutionTaskProcessingStage, {

	getStateValue: function() {
		return AutoResolutionConstants.TASK_PROCESSING_STATE.AI_SEARCH;
	},

	execute: function(contextFieldValueMap) {
		this.prepare(contextFieldValueMap, this.type);

		// Exit if we should not execute AI Search
		if (!this.shouldExecuteAISearch(contextFieldValueMap.matched_topic))
			return this.response;

		if (gs.nil(this.userId)) {
			this.setError('No valid user for AI Search');
			return this.response;
		}

		if (gs.nil(contextFieldValueMap.prediction)) {
			this.setError('There is no prediction record to get a search query from');
			return this.response;
		}

		var searchQuery = AutoResolutionPredictionHelper.getSearchQueryByPredictionId(contextFieldValueMap.prediction);
		if (gs.nil(searchQuery) || searchQuery.trim().length === 0) {
			this.setError('No valid search query');
			return this.response;
		}

		var botUserId = AutoResolutionUtil.getBotUserId(this.taskGr.getTableName());
		var aisStatus = AutoResolutionConstants.AIS_STATUS_SUCCESS;
		var aisStartTs = new GlideDateTime().getNumericValue();
		var searchResults = '';
		var aisMessage = '';

		try {
			searchResults = this.getSearchResults(searchQuery, this.userId, botUserId);
		} catch(e) {
			this.setError('Unexpected error performing AI Search');
			return this.response;
		}

		var timeDiff = new GlideDateTime().getNumericValue() - aisStartTs;
		var aisSearchResult = this._saveAISearchResults(searchQuery, searchResults, timeDiff, aisStatus, aisMessage);

		if (!gs.nil(aisSearchResult))
			this.setContextValue('ais_result', aisSearchResult.getSysId());

		if (VAAISearchHelperTokyo.doesSearchResultsHaveItems(searchResults)) {
			var aisTopic = this.configGr.getElement('ais_topic').getRefRecord();
			var isAISTopicActive = aisTopic.getValue('active') === '1';
			if (isAISTopicActive) {
				this.setContextValue('matched_topic', aisTopic.getUniqueValue());
				this.LOGGER.debug('Found active AIS display topic: {0}', aisTopic.getValue('name'));
			} else {
				this.setError('AI Search display topic is not active');
			}
		} else {
			var message = 'No AI Search results to display';
			this.LOGGER.info(message);
			this.setError(message);
		}

		return this.response;
	},

	/**
	 * Returns true if AIS is enabled globally and on the IAR configuration
	 * @param {string} matchedTopic - topic found from previous stages
	 * @returns {boolean}
	 */
	shouldExecuteAISearch: function(matchedTopic) {
		return VAAISearchHelper.isSearchEnabled() &&
			this.configGr.getValue('ais_enabled') === '1' &&
			gs.nil(matchedTopic);
	},

	/**
	 * Perform the search result as the notification_user
	 *
	 * @param configGr configuration to read the EVAM and search app from
	 * @param userId user to impersonate for search request
	 * @param botUserId bot user to impersonate back to after search request
	 * @returns {string|*} raw search results
	 */
	getSearchResults: function(searchTerm, userId, botUserId) {
		var evamDefinitionID = this.configGr.getValue('evam_definition');
		var searchAppID = this.configGr.getValue('search_application');
		var locale = AutoResolutionAISearchHelper.getLocaleForAISearch(this.contextGr);
		var searchResults = '';
		var gi = new GlideImpersonate();
		gi.impersonate(userId);
		this.LOGGER.info('Executing AI Search for Auto-Resolution as userId: ' + userId);
		try {
			searchResults = sn_cs.VASystemObject.performAutoResolutionSearch(searchTerm, evamDefinitionID, searchAppID,
				locale, this.LOGGING_UTILS.CONTEXT);
		} catch (e) {
			this.LOGGER.error('Error getting AI Search results: {0}', e);
			throw e;
		} finally {
			gi.impersonate(botUserId);
		}
		return searchResults;
	},

	/**
	 * Persists AI Search result and associate the result with the context_id
	 * @return a instance of AutoResolutionAISearchResult object
	 */
	_saveAISearchResults: function(searchQuery, searchResults, executionTime, status, message) {
		var lang = AutoResolutionAISearchHelper.getLanguageForAISearch(this.contextGr);
		return AutoResolutionAISearchResult.create(this.contextGr, searchQuery, searchResults, executionTime, status,
													message, lang);
	},

	type: 'AutoResolutionAISearchStage'
});
