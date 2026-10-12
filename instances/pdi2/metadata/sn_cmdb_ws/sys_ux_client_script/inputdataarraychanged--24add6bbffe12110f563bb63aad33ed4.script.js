function script({ api, event, imports }) {
    // InputDataArrayChanged script in Filter and Sort controller, fired by MACROPONENT_PROPERTY_CHANGED
    // requires a property in the inputData called name
    const { sortAndFilter } = imports["sn_cmdb_ws.UnifiedMapSearchSortUtility"]();
    const { inputData } = api.context.props;
    const { sortDirection, sortCategory, searchTerm } = api.state;
    // reset the showFilter and calculate total counts
    api.setState('showFilter', false);
    api.setState('totalInputCount', inputData.length);
    const sortedAndFilteredArray = sortAndFilter(inputData, sortDirection, sortCategory, searchTerm);
    api.setState('filteredOutput', sortedAndFilteredArray);
    api.setState('filteredOutputCount', sortedAndFilteredArray ? sortedAndFilteredArray.length : 0);
}
