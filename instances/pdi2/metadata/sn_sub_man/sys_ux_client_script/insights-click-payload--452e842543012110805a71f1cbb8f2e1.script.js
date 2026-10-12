/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // get subscription name and category from payload
    const insightsSubName = event.payload.row.rowData.value.get("product").columnData.displayValue;
    const insightsCategory = event.payload.row.rowData.value.get("category").columnData.displayValue;

    // save it to state
    api.setState('insightsSubName', insightsSubName);
    api.setState('insightsCategory', insightsCategory);

    // call glide query for records matfching insightsSubName
    api.data.gliderecord_query_1.refresh();
}
