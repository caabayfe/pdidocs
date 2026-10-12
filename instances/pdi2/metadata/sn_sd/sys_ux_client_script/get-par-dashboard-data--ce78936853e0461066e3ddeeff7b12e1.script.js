/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    let dashboardConfig = (await imports['sn_sd.getPARDashboardAPI'](helpers, api.context.props.dashboardId, api.state.visibility)).response.result;
    let visualizationInfo = [];
    let widgetIds = new Set();

    if (dashboardConfig.success) {
        let tabs = dashboardConfig.data.layout.tabs;
        tabs.forEach(function(tab) {
            tab.layout.forEach(function(visualization) {
               let config = JSON.parse(visualization.component_props),
                    name;
                if (config.filterName) name = config.filterName;
                if (config.headerTitle) name = config.headerTitle;
                visualizationInfo.push({
                    "vizName": name,
                    "description": config.description,
                    "vizType": visualization.sys_id
                });
                widgetIds.add(visualization.sys_id);
            });
        });
    }
    await api.setState('visualizationData', visualizationInfo);
    await api.setState('widgetIds', [...widgetIds].join(','));
    api.data.get_visualization_type.refresh();
}
