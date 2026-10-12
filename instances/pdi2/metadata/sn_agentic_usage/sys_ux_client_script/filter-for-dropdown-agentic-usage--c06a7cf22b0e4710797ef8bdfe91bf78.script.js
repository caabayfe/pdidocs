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

    const FILTER_ID = 'mcp_client_filter';
    const OBSERVABILITY_KEY = 'StringAttributes.sn.glide.action_fabric.integration_client';

    const { filterConfigurations = [], parFilters = [] } = api.state;

    let updatedFilterConfig = filterConfigurations.filter(fc => fc.filterId !== FILTER_ID);
    let updatedUiFilters = parFilters.filter(f => f.filterId !== FILTER_ID);

    if (value) {
        updatedFilterConfig.push({
            filterId: FILTER_ID,
            type: 'CHOICE',
            apply_to: [{ type: 'OBSERVABILITY', payload: { observability: OBSERVABILITY_KEY } }],
            values: [String(value)]
        });
        updatedUiFilters.push({
            filterId: FILTER_ID,
            label: 'MCP Client: ' + String(value),
            values: [String(value)]
        });
    }

    updatedFilterConfig = updatedFilterConfig.map((fc, i) => ({ ...fc, order: i }));
    updatedUiFilters = updatedUiFilters.map((f, i) => ({ ...f, order: i }));

    api.setState('filterConfigurations', updatedFilterConfig);
    api.setState('parFilters', updatedUiFilters);

    api.refreshDataResource('trendby_visualization_line_tables');
    api.refreshDataResource('trendby_visualization_action_fabric_1');
    api.refreshDataResource('monthly_trendby_visualization_action_fabric_2');
    api.refreshDataResource('trendby_visualization_line_mcp_client');
}
