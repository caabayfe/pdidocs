function script({ api, event, imports }) {
    //InputDataArrayChanged script in Filter and Sort controller, fired by MACROPONENT_PROPERTY_CHANGED; requires a property in the inputData called name
    const { sortAndFilter, SORT_SEARCH_DEFAULTS } = imports["sn_cmdb_ws.UnifiedMapSearchSortUtility"]();
    const { inputData } = api.context.props;

   // reset sort and search state variables
    api.setState("sortCategory",SORT_SEARCH_DEFAULTS.SORT_CATEGORY);
    api.setState("sortDirection", SORT_SEARCH_DEFAULTS.SORT_DIRECTION);
    api.setState("searchTerm", SORT_SEARCH_DEFAULTS.SEARCH_TERM);
    // reset the showFilter and calculate total counts
    api.setState('showFilter', false);
    api.setState('totalInputCount', inputData.length);
    const sortedAndFilteredArray = sortAndFilter(inputData, SORT_SEARCH_DEFAULTS.SORT_DIRECTION, SORT_SEARCH_DEFAULTS.SORT_CATEGORY, SORT_SEARCH_DEFAULTS.SEARCH_TERM);
    api.setState('filteredOutput', sortedAndFilteredArray);
    api.setState('filteredOutputCount', sortedAndFilteredArray.length);
}
