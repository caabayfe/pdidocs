function script({ api, event, helpers, imports }) {

	/** SearchAndSortCards in Sort and Filter controller
	 * Fired when the search or sort context has changed in the search/sort UI 
	 */
	const { sortAndFilter } = imports["sn_cmdb_ws.UnifiedMapSearchSortUtility"]();

	const SORT = {
		SORT_RADIO_BUTTON_ID: "properties_sort_direction_radio",
		CATEGORY_RADIO_BUTTON_ID: "properties_sort_category_radio"
	}

	const SEARCH = {
		SEARCH_INPUT_ID: "properties_items_search_input",
		SEARCH_CLEAR_BUTTON_ID: "prop_items_clear_search_icon_button",
		SEARCH_TERM: "searchTerm",
		SORT_DIRECTION: "sortDirection",
		SORT_CATEGORY: "sortCategory"
	}

	let searchTermRaw = "";
	let { sortDirection, sortCategory } = api.state;

	if (!event || !event.elementId) {
		// script should only be triggered by component interaction
		return;
	}

	if (api.state.searchTerm && event.elementId !== SEARCH.SEARCH_CLEAR_BUTTON_ID) {
		searchTermRaw = api.state.searchTerm;
	}

	if (event.elementId === SEARCH.SEARCH_CLEAR_BUTTON_ID) {
		api.setState(SEARCH.SEARCH_TERM, '');
		searchTermRaw = '';
	} else if (event.elementId === SEARCH.SEARCH_INPUT_ID && event.payload) {
		searchTermRaw = event.payload.fieldValue;
		api.setState(SEARCH.SEARCH_TERM, searchTermRaw);
	} else if (event.elementId === SORT.SORT_RADIO_BUTTON_ID) {
		sortDirection = event.payload;
		api.setState(SEARCH.SORT_DIRECTION, sortDirection);
	} else if (event.elementId === SORT.CATEGORY_RADIO_BUTTON_ID) {
		sortCategory = event.payload;
		api.setState(SEARCH.SORT_CATEGORY, sortCategory);
	}

	const { inputData } = api.context.props;

	const sortedAndFilteredArray = sortAndFilter(inputData, sortDirection, sortCategory, searchTermRaw);

	//For sort case using this to force the refresh
    api.setState('filteredOutput', '');
 	helpers.timing.setTimeout(() => {
    	api.setState('filteredOutput', sortedAndFilteredArray);
    }, 0);
	
}
