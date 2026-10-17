(function() {
    data.showFilterContainer = false;
    data.hideFilters = options.hideFilters;

    if (!input) {
        data.filterData = (options.filterData) ? options.filterData : '';
        if (data.filterData && data.filterData.length > 0) {
            data.showFilterContainer = true;
        }
    }
})();
