/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('apiStatus', {});
    const dimensions = api.data.pa_new_model_kpi_config_1.output.data.GlideKpiConfig_Query.kpiConfigDetail.dimensions;
    if(dimensions && dimensions.length === 0){
        api.setState('apiStatus', { "target": "filter", "type": "no-data" });
    }
    const result = [];
    try {
        for (var i = 0; dimensions && i < dimensions.length; i++) {
            const element = {};
            element.name = dimensions[i].label;
            element.sysId = dimensions[i].value;
            element.elements = [];
            element.elementFilters = [];
            result.push(element);
        }
        result.sort((a, b) => a.name > b.name ? 1 : -1);
    } catch(err) {
        api.setState('apiStatus', { "target": "filter", "type": "interrupted" });
    }
    api.setState('dimensions', result);
}
