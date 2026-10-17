if(!paginationToken || paginationToken == "undefined") {
	paginationToken = '';
}
if(!query) {
	query = "***";
}

var api = new sn_search.ScriptableSearchAPI();
var searchContextConfigId = '492f958dc30101103f4fcd7b7940dd2a';
var searchTerm = query;
var disableSpellCheck = false;
var facetFilters = [];
var searchFilters = [];
var requestedFields = {
 kb_knowledge: ['author', 'category', 'text', 'sys_view_count', 'number']
};

var response = api.search(searchContextConfigId, searchTerm, paginationToken, disableSpellCheck,
 facetFilters, searchFilters, requestedFields);

var results = response.getSearchResults();

var items = results.map(function(result) {
            var columns = result.getColumns();
            var fields = {};
            columns.forEach(function(column) {
                fields[column.getFieldName()] = column.getDisplayValue();
            });
            return {
				value: fields['number'],
				displayValue: result.getTitle(),
				aisDetails: {
					title: result.getTitle(),
					summary: result.getText(),
					detailValueOne: fields['number'],
					detailLabelSeparator: "•",
					detailLabelType: "inline",
					nextPaginationToken: response.getNextPaginationToken(),
					prevPaginationToken: response.getPreviousPaginationToken()
				}
            };
        });
answer = {
	items: items
};
