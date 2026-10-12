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
    if (api.state.isFirstLoad) {
        api.setState('isFirstLoad', false);
        if (!api.context.app.hideListOnLandingPage) {
            var response = api.data.dashboard_controller_1.data && api.data.dashboard_controller_1.data.data;
            var selectedDashboard = response && response.sys_id ? response.sys_id : null;
            var tabs = response && response.layout ? response.layout.tabs : null;
            var layout = tabs && tabs.length ? tabs[0].layout : [];
            var widgetClicked = api.state.widgetClicked;
            var hideList = api.state.hideList;
            if (selectedDashboard !== api.state.visibleDashboard) {
                widgetClicked = false;
                hideList = true;
                api.setState('visibleDashboard', selectedDashboard);
                api.setState('widgetClicked', widgetClicked);
                api.setState('hideList', hideList);
            }
            if (!widgetClicked && layout && layout.length > 0) {
                var minElement = layout[0];
                for (var i = 1; i < layout.length; i++) {
                    var current = layout[i];
                    if (current.x < minElement.x || (current.x === minElement.x && current.y < minElement.y)) {
                        minElement = current;
                    }
                }
                var propsObj = minElement.props;
                if (propsObj != null) {
                    var dataSource = propsObj.dataSources[0];
                    var obj = {
                        ...api.state.currentVizSelection,
                        table: dataSource.tableOrViewName,
                        query: dataSource.filterQuery + '^ORDERBYDESCsys_updated_on',
                        title: propsObj.headerTitle,
                        listView: 'sow_landing_page'
                    };
                    api.setState('currentVizSelection', obj);
                }
            }
        }
    } else {
        var dashboardSysId = event.payload.params.dashboardSysId;
        api.setState('visibleDashboard', dashboardSysId);
        api.setState('hideList', true);
    }
}
