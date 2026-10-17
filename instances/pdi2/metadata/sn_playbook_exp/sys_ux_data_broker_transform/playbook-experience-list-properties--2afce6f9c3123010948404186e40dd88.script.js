function transform(input) {
	var experienceProperties = input.experienceProperties || {};
	var maxColumns = (experienceProperties.max_columns || {}).value || "";
	var rowCount = (experienceProperties.row_count || {}).value || "";
	var listTitle = (experienceProperties.list_title || {}).value || "";
	
	return {
		maxColumns: parseInt(maxColumns) || 0,
		rowCount: parseInt(rowCount) || 0,
		hideListTitle: !listTitle
	};
}
