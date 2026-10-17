/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
    let { value } = event.payload;
    if (Array.isArray(value)) value = value[0];
    if (value === 'NONE') value = null;

    const FILTER_ID = 'flow_name_filter';
    const OBSERVABILITY_KEY = 'StringAttributes.sn.glide.action_fabric.flow_name';
    
    const { flowAccessFilterConfigurations = [], flowAccessParFilters = [] } = api.state;

    let updatedFilterConfig = flowAccessFilterConfigurations.filter(fc => fc.filterId !== FILTER_ID);
    let updatedUiFilters = flowAccessParFilters.filter(f => f.filterId !== FILTER_ID);

    if (value) {
        updatedFilterConfig.push({
            filterId: FILTER_ID,
            type: 'CHOICE',
            apply_to: [{ type: 'OBSERVABILITY', payload: { observability: OBSERVABILITY_KEY } }],
            values: [String(value)]
        });
        updatedUiFilters.push({
            filterId: FILTER_ID,
            label: 'Flow Name: ' + String(value),
            values: [String(value)]
        });
    }

    updatedFilterConfig = updatedFilterConfig.map((fc, i) => ({ ...fc, order: i }));
    updatedUiFilters = updatedUiFilters.map((f, i) => ({ ...f, order: i }));

    api.setState('flowAccessFilterConfigurations', updatedFilterConfig);
    api.setState('flowAccessParFilters', updatedUiFilters);

    api.refreshDataResource('trendby_visualization_flow');
    api.refreshDataResource('trendby_visualization_flow_monthly');
    api.refreshDataResource('trendby_visualization_line_flow_tables');
    api.refreshDataResource('trendby_visualization_line_flow_mcp');
}
