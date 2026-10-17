/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const dashboardUtils = imports["sn_notif_dashboard.NotificationDashboardUtils"]();
    var selectedTab = api.state.selectedTab;

    var tabsConfiguration = api.state.tabsConfiguration[selectedTab];
    var pageSizeParameterName = tabsConfiguration["pageSize"];
    var pageNumberParamterName = tabsConfiguration["pageNumber"];
    var totalRecordsParamterName = tabsConfiguration["totalRecords"];
    var tableParamterName = tabsConfiguration["tableParameter"];

    var existingPageSize = api.state[pageNumberParamterName];
    var totalRecords = api.state[totalRecordsParamterName];

    var eventPayload = event.payload;

    if ("NOW_PAGINATION_CONTROL#SELECTED_PAGE_SET" == event.name) {
        var newPage = eventPayload.value;
        api.setState(pageNumberParamterName,({currentValue, api}) => {
            var latestPageSize = api.state[pageSizeParameterName];
            var latestPageNumber = newPage;
            var totalRecords = api.state[totalRecordsParamterName];
            var start = latestPageNumber * latestPageSize;
            var end = (latestPageNumber+1)* latestPageSize;

            var tableMarkup = dashboardUtils.generateTable(api.state.selectedTab, totalRecords.slice(start, end), {
                key: "notificationSysId"
            });   
            api.setState(tableParamterName, tableMarkup);

            return newPage;
        });

    } else if ("NOW_PAGINATION_CONTROL#SELECTED_PAGE_SIZE_SET" == event.name) {
        api.setState(pageSizeParameterName, eventPayload.value);
    }
}
