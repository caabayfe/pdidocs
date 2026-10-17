function transform(input) {
	var statusTabSetConfig = [];
	var allUpdatesConfig = CriticalUpdatesConstants.UPDATES_VIEW.ALL_UPDATES_CONFIG;
	var highlightedColorConfig = CriticalUpdatesConstants.UPDATES_VIEW.HIGHLIGHTED_CONFIG;
	var encodedQueriesWithLabels =  CriticalUpdatesConstants.UPDATES_VIEW.ENCODED_QUERIES_WITH_LABELS;
	encodedQueriesWithLabels.forEach(function(encodedQueryWithLabel, index){
		var gr = new GlideRecord(CriticalUpdatesConstants.TABLE_CONSTANTS.TABLE);
		gr.addEncodedQuery(encodedQueryWithLabel["query"]);
		gr.query();
		statusTabSetConfig.push({
			"icon":"",
			"label":encodedQueryWithLabel["label_for_tabs"],
			"count":gr.getRowCount(),
			"fields":null
		});
		while (gr.next()) {
			var priority, priorityLabel, highlightedColorType;
			priority = gr.getValue("up_update_priority");
			priorityLabel = gr.getDisplayValue("up_update_priority");
			highlightedColorType = priority ? highlightedColorConfig[priority] : '';
			allUpdatesConfig[encodedQueryWithLabel["label_for_data_key"]].push({
				"sysId" : gr.getValue("sys_id"),
				"priority" : priorityLabel,
				"highlightedColorType" : highlightedColorType,
				"status" : gr.getDisplayValue("up_update_status"),
				"title" : gr.getDisplayValue("up_name"),
				"summary" : gr.getDisplayValue("up_summary"),
				"dueDate" : gr.getDisplayValue("up_due_date")
			});
		}
	});
	allUpdatesConfig.tabSetsConfig = statusTabSetConfig;
	return allUpdatesConfig;
}
