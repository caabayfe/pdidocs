(function() {
    data.isMobile = gs.isMobile();
    data.showFilterContainer = false;
    data.clearLabel = gs.getMessage("Clear Filter {0}");
    data.initialSearchText = decodeURIComponent(options.searchText) || "";
    data.hideFilters = options.hideFilters;

    if (!input) {
        data.filterData = (options.filterData) ? options.filterData : '';
        if (data.filterData && data.filterData.length > 0) {
            data.showFilterContainer = true;
        }
    }
})();
