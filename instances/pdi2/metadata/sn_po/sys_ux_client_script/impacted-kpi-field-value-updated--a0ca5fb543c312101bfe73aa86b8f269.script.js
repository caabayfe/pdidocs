/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.get_impacted_kpi_items.execute({
        table: 'pa_indicators',
        searchTerm: event.payload.value,
    });
}
