var VAAISearchClickMetricsURLHelper = Class.create();

/**
* Creates a URL that contains metrics and target URL for Genius Search Result.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qalified URL . eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAAISearchClickMetricsURLHelper.createGeniusSearchEventMetricsURL = function(searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, url, index) {
	
	// If click metrics is not allowed, don't need to create a special URL.
	if (!global.VAClickMetrics.isAISearchClickMetricsAllowed()) 
		return global.VAClickMetrics.createClickMetricsURL(vaSystem, url, {}, global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
	
	var logger = VAAISearchHelper.getLogger(vaVars.loggingContext);

	var s1 = new GlideDateTime().getNumericValue();
	// if click-metrics is allowed, collect metrics.
	var collector = new global.VAAIGeniusResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);
	collector.collect(geniusSearchResults, index);
	collector.sendOutMetrics();
	var e1 = new GlideDateTime().getNumericValue();
	logger.debug("Total time taken to collect and send genius result event metrics: {0}", (e1 - s1).toString());
	
	var s2 = new GlideDateTime().getNumericValue();
	var clickMetricsURL = VAClickMetrics.createClickMetricsURL(vaSystem, url, collector.getPayload(), global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
	var e2 = new GlideDateTime().getNumericValue();
	logger.debug("Total time taken to create genius search event metrics URL: {0}", (e2 - s2).toString());

	return clickMetricsURL;
};

/**
* Creates a URL that contains metrics and target URL for regular search results.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qualified URL. eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAAISearchClickMetricsURLHelper.createSearchResultEventMetricsURL = function(searchMetadata, searchResult, vaSystem, vaInputs, vaVars, url, index) {
	
	// If the signal operation is not allowed, don't need to create a special URL
	if (!global.VAClickMetrics.isAISearchClickMetricsAllowed())
		return global.VAClickMetrics.createClickMetricsURL(vaSystem, url, {}, global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);

	var logger = VAAISearchHelper.getLogger(vaVars.loggingContext);

	var s1 = new GlideDateTime().getNumericValue();
	var collector = new global.VAAISearchResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);
	collector.collect(searchResult, index);
	var e1 = new GlideDateTime().getNumericValue();
	logger.debug("Total time taken to collect search result event metrics: {0}", (e1 - s1).toString());
	
    var s2 = new GlideDateTime().getNumericValue();
	// Be aware that SEARCH_RESULT_DISPLAYED event is not getting sent here. It's already sent via VAAISearchHelperUtah.createResultMap
	var clickMetricsURL = global.VAClickMetrics.createClickMetricsURL(vaSystem, url, collector.getPayload(), global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
	var e2 = new GlideDateTime().getNumericValue();
	logger.debug("Total time taken to create search result event metrics URL: {0}", (e2 - s2).toString());

	return clickMetricsURL;
};

/**
* Creates a URL that contains metrics and target URL for the provided resultType.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qualified URL. eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAAISearchClickMetricsURLHelper.createResultEventMetricsURL = function(resultType, searchMetadata, searchResult, vaSystem, vaInputs, vaVars, url , index) {

	if (gs.nil(resultType))
		throw 'Result type must exist';
	
	if (resultType == global.AISearchConstants.RESULT_TYPE_GENIUS) {
		return global.VAAISearchClickMetricsURLHelper.createGeniusSearchEventMetricsURL(
			searchMetadata, searchResult, vaSystem, vaInputs, vaVars, url, index);
	}
	else if(resultType == global.AISearchConstants.RESULT_TYPE_SEARCH) {
		return global.VAAISearchClickMetricsURLHelper.createSearchResultEventMetricsURL(
			searchMetadata, searchResult, vaSystem, vaInputs, vaVars, url, index);
	}

	throw  'The provided result type:'+ resultType +' is not supported';
};

/**
* Send SEARCH_RESULT_DISPLAYED event
*/
VAAISearchClickMetricsURLHelper.createDisplayedSearchResultEventMetrics = function(searchMetadata, searchResult, vaSystem, vaInputs, vaVars, index) {
	
	// If the signal operation is not allowed, don't need to create a special URL
	if (!global.VAClickMetrics.isAISearchClickMetricsAllowed())
		return {};

	var collector = new global.VAAISearchResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);

	collector.collect(searchResult, index);
	
	collector.sendOutMetrics();
	
	return collector.getPayload();
};
