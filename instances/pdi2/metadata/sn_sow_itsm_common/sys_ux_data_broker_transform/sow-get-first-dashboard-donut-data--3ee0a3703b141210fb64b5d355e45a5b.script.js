function transform(input) {
    var dashUtil = new sn_dashboard_api.PARDashboardUtil();
    var dashboardValue = dashUtil.getDashboard(input.dashboard_id);

    try {
        var dashboardDataObj = JSON.parse(dashboardValue);
    } catch (e) {
        return {
            error: 'Failed to parse JSON',
            details: e.message
        };
    }

    if (!dashboardDataObj || !dashboardDataObj.layout || typeof dashboardDataObj.layout !== 'object' || !Array.isArray(dashboardDataObj.layout.tabs)) {
        return null;
    }

    var tabs = dashboardDataObj.layout.tabs;

    if (tabs.length === 0) {
        return null;
    }

    var layoutArray = tabs[0].layout;

    if (!Array.isArray(layoutArray) || layoutArray.length === 0) {
        return null;
    }

    var minElement = layoutArray[0];
    for (var i = 1; i < layoutArray.length; i++) {
        var current = layoutArray[i];
        if (current.x < minElement.x || (current.x === minElement.x && current.y < minElement.y)) {
            minElement = current;
        }
    }

    var componentProps = minElement.component_props;
    var componentPropsObj = JSON.parse(componentProps);
    // Extract the required values
    var filterQuery = componentPropsObj.dataSources[0].filterQuery;
    var tableOrViewName = componentPropsObj.dataSources[0].tableOrViewName;
    var headerTitle = componentPropsObj.headerTitle;

    return {
        filterQuery: filterQuery,
        tableOrViewName: tableOrViewName,
        headerTitle: headerTitle
    };
}
