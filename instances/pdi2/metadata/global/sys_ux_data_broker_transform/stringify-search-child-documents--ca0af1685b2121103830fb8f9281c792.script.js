function transform(input) {
	var searchResults = input.searchData.searchResults;
	
	var transformedSearchResults = searchResults.map(function(result) {
		var columns = [];
		if (result.columns) {
			columns = result.columns.map(function(column) {
				if (column.fieldName == 'child_docs')
					return {
						fieldName: column.fieldName,
						value: JSON.stringify(column.value)
					};

				return column;
			});
		}

		return {
			sys_id: result.sys_id,
			table: result.table,
			columns: columns
		};
	});

	return {
		searchResults: transformedSearchResults
	};
}
