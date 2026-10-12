function include(proxyArg, params) {
    const { api, event, helpers, imports } = params; 
      
    const _sortByColumn = async function(columnName, currSortDirection, columns, rows) {

        var SORTED_A_Z = await helpers.translate("Sorted A-Z");
	var SORTED_Z_A = await helpers.translate("Sorted Z-A");
	var SORT_ASCENDING_KEY = "ascending";
	var SORT_DESCENDING_KEY = "descending";
        var isSortedAsc = currSortDirection == SORT_ASCENDING_KEY;

         columns.forEach((column) => {
		if (column.key == columnName) {
			if (isSortedAsc) {
				// current = asc, sort descending
				column.icons = {
					"endIcons": [{
						value: "caret-down-fill",
						label: SORTED_Z_A
					}]
				};
				column.sortDirection = SORT_DESCENDING_KEY;
			}
			else {
				// current = desc/none, sort ascending
				column.icons = {
					"endIcons": [{
						value: "caret-up-fill",
						label: SORTED_A_Z
					}]
				};
				column.sortDirection = SORT_ASCENDING_KEY;
			}
		} else {
			column.icons = {};
			column.sortDirection = "none";
		}
	});

	rows.sort((a, b) => {
		let valueA = a.cells[columnName] ? a.cells[columnName].value : null;
		let valueB = b.cells[columnName] ? b.cells[columnName].value : null;
		if (valueA == null && valueB == null) return 0;
		if (valueA == null) return isSortedAsc ? 1 : -1;
		if (valueB == null) return isSortedAsc ? -1 : 1;
		return isSortedAsc ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
	});
    }

    return {
        sortByColumn: _sortByColumn
   };
   
 }
