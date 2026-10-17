var gd = new GlideDateTime();
var toDate = gd.getDate().getValue();
gd.addMonthsLocalTime(-1);
var fromDate = gd.getDate().getValue();

var filterBody = {
    "from_date": fromDate,
    "to_date": toDate,
    "query": "[{\"field\":\"Type\",\"operator\":{\"type\":\"Array\",\"internal_value\":\"is any of\"},\"comparisonType\":\"NEW_QUERY\",\"children\":[],\"conditionValue\":[\"VA to LA\"]}]",
    "page_num": 1,
    "page_size": 20,
    "timestamp": 1665567845716
};
var vaUtils = new sn_ci_analytics.VADashboardUtils();
var encodedFilter = vaUtils.encodeFilter(filterBody);
var input = {
    query: encodedFilter,
};
var count = 0;
try {
    var decodedQuery = vaUtils.decodeFilter(input.query);
    var filter = decodedQuery.filter;
    if (filter.query) {
        var requestQueries = vaUtils.getConversationFilterQuery(input.query);
        var filteredCountResponse = AnalyticsServiceInvoker.invoke("Session", "getCount", requestQueries.filterQuery);
		count = filteredCountResponse.Count;
    }
} catch (ex) {
    gs.error(ex);
}
answer = count;
