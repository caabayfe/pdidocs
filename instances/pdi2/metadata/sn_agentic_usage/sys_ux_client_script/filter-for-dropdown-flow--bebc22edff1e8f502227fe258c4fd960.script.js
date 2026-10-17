function handler({ api, event, helpers, imports }) {
    let { value } = event.payload;
    if (Array.isArray(value)) value = value[0];
    if (value === 'NONE') value = null;

    const FILTER_ID = 'flow_mcp_client_filter';
    const OBSERVABILITY_KEY = 'StringAttributes.sn.glide.action_fabric.flow_integration_client';

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
            label: 'MCP Client: ' + String(value),
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
