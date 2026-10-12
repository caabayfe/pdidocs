function include(rawArray, sortDirection, sortField, searchTerm) {
	/**
	 * Search function takes an arbitrary array of json objects and searches / sorts against the included searchTerm
	 * sortField, and sort direction
	 */

	const SORT = {
		ASC: "asc",
		DESC: "desc",
	}

	const TYPES = {
		NUMBER: "number",
		STRING: "string",
		OBJECT: "object"
	}

	const _sortAndFilter = (rawArray, sortDirection, sortField, searchTerm) => {
		let sortedAndFilteredArray = rawArray;
		sortedAndFilteredArray = sortedAndFilteredArray.filter((card) => {
			if (!card.properties) {
				console.error("SearchSortUtility expects a card to have an object called properties. Unable to search.")
				return true;
			}

			return Object.values(card.properties).findIndex(value => {
				if (!value || typeof value === TYPES.OBJECT)
					return false;
				if (typeof value === TYPES.NUMBER) {
					if (isNaN(searchTerm))
						return false;
					else
						return (value + "").includes(searchTerm);
				} else {
					return value.toUpperCase().includes(searchTerm.toUpperCase());
				}
			}) > -1;
		});
		sortedAndFilteredArray.sort((firstSvc, secondSvc) => {
			if (!firstSvc.properties || !secondSvc.properties)
				return 0;

			let firstProp = firstSvc.properties[sortField];
			let secondProp = secondSvc.properties[sortField];
			// ensure that mixed numbers and null are sorted correctly. 
			// If the type is not a number, assign empty string to string compare
			if (!firstProp) {
				if (typeof secondProp === TYPES.NUMBER)
					return sortDirection === SORT.ASC ? -1 : 1;
				else
					firstProp = "";
			} else if (!secondProp) {
				if (typeof firstProp === TYPES.NUMBER)
					return sortDirection === SORT.ASC ? 1 : -1;
				else
					secondProp = "";
			}
			if (typeof firstProp === TYPES.NUMBER && typeof secondProp === TYPES.NUMBER) {
				if (firstProp < secondProp)
					return sortDirection === SORT.ASC ? -1 : 1;
				else if (firstProp > secondProp)
					return sortDirection === SORT.ASC ? 1 : -1;
				else
					return 0;
			} else if (typeof firstProp === TYPES.STRING && typeof secondProp === TYPES.STRING) {   
				if (firstProp.toUpperCase() < secondProp.toUpperCase())
					return sortDirection === SORT.ASC ? -1 : 1;
				else if (firstProp.toUpperCase() > secondProp.toUpperCase())
					return sortDirection === SORT.ASC ? 1 : -1;
				else
					return 0;
			} else {
				// could not compare
				return 0;
			}
		});
		return sortedAndFilteredArray;
	}

	const _SORT_SEARCH_DEFAULTS = {
		SORT_CATEGORY: "name",
		SORT_DIRECTION: "asc",
		SEARCH_TERM: ""
	}

	return {
		SORT_SEARCH_DEFAULTS: _SORT_SEARCH_DEFAULTS,
		sortAndFilter: _sortAndFilter
	};
}
