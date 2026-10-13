function transform(input) {
	var result = {};
    var vaUtils = new sn_ci_analytics.VADashboardUtils();
    
	try {
        var decodedQuery = vaUtils.decodeFilter(input.query);
        var filter = decodedQuery.filter;
        if (filter.query) {
            var fromDate = filter.from_date;
            var toDate = filter.to_date;
            var requestQueries = vaUtils.getConversationFilterQuery(input.query);
            var filteredCountResponse = AnalyticsServiceInvoker.invoke("Session", "getCount", requestQueries.filterQuery);
            var totalCountResponse = AnalyticsServiceInvoker.invoke("Session", "getCount", requestQueries.totalQuery);
            var count = filteredCountResponse && filteredCountResponse.Count || null;
            result = {
                totalCount: totalCountResponse.Count || null,
                currentCountFormatted: filteredCountResponse.Count ? vaUtils.numFormatter(filteredCountResponse.Count) : null,
                currentCount: filteredCountResponse.Count || null,
                percentage: (totalCountResponse.Count && filteredCountResponse.Count) ? (filteredCountResponse.Count / totalCountResponse.Count) : null
            };
            CIAnalyticsLogger.getLogger('ConversationsCount').debug('Data broker result - ' + JSON.stringify(result));
        }
    } catch (ex) {
        gs.error(ex);
        gs.addErrorMessage(ex.message);
    }
	
	return result;
}
