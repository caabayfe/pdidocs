/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // update the component 
    api.data.data_visualization_api_for_bar_chart_data_source.refresh();
    let query = api.state.listFilters
        .split("^")
        .filter(param => !param.startsWith("group_id"))
        .join("^");
    api.setState("listFilters", query);
    api.setState('alertContents', []);
    api.setState('selectedGroup', '');
}  
