(function() {
    data.isMobile = gs.isMobile();
    data.showFilterContainer = false;
    data.preselectedFilters = $sp.getParameter('filters') ? $sp.getParameter('filters').split(',') : [];
    data.clearLabel = gs.getMessage("Clear Filter {0}");

    if (!input) {
        var todosFilterUtil = new sn_ex_sp.TodosFilterUtil();
        data.filterData = (options.filterData) ? options.filterData : todosFilterUtil.getFilters();

        if (data.filterData && data.filterData.length > 0) {
            data.showFilterContainer = true;
        }
    }

})();
