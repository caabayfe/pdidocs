var AISearchGlideSignalsSearchEvent = Class.create();

AISearchGlideSignalsSearchEvent.prototype = Object.extendsObject(global.AISearchGlideSignalsEvent, {
	
	initialize: function(searchResultMetadata, paramBag) {
		
		this.payload = {};
		this.searchResultMetadata = searchResultMetadata;
		this.payload = searchResultMetadata[global.AISearchConstants.SEARCH_ANALYTICS_PAYLOAD];
		
		//Need to override userId and sessionId. If not, maint / SYSTEM will be used. 
		if(!gs.nil(this.payload) && !gs.nil(paramBag)) {
			this.payload[global.AISearchConstants.SESSION_ID] = paramBag[global.AISearchConstants.SESSION_ID];
			this.payload[global.AISearchConstants.USER_ID] = paramBag[global.AISearchConstants.USER_ID];
		}
	},
	
	/**
	* Build the events
	*/
	buildPayload: function(resultType, searchResult) {
		// do nothing. analytics payload contains all.
	},
	
	getEventType : function() {
		return global.AISearchConstants.EVENT_TYPE_SEARCH_EVENT;
	},
	type: 'AISearchGlideSignalsSearchEvent'
});

/**
* Returns the query language from searchResultMetadata
*/
AISearchGlideSignalsSearchEvent.getQueryLanguageFromSearchResultMetadata = function(searchResultMetadata) {
	return searchResultMetadata[global.AISearchConstants.QUERY_LANGUAGE];
};
