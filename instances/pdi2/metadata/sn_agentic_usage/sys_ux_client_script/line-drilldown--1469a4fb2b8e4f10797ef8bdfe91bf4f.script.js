/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {

    // Field keys this app actually filters on (confirmed from your existing filter scripts)
    const CLIENT_FIELD = 'StringAttributes.sn.glide.action_fabric.integration_client';
    const TABLE_FIELD = 'StringAttributes.sn.glide.action_fabric.table_name';

    // Which line chart's clicked series maps to which field.
    // line_1 = MCP Client (Record Access), line_2 = Tables (Record Access),
    // line_3 = MCP Client (Flow Execution), line_4 = Tables (Flow Execution).
    const CHART_GROUP_FIELD = {
        line_1: CLIENT_FIELD,
        line_2: TABLE_FIELD,
        line_3: CLIENT_FIELD,
        line_4: TABLE_FIELD
    };

    // Record Access charts use record_action, Flow Execution charts use flow_action.
    const CHART_METRIC = {
        line_1: 'sn.glide.action_fabric.record_action',
        line_2: 'sn.glide.action_fabric.record_action',
        line_3: 'sn.glide.action_fabric.flow_action',
        line_4: 'sn.glide.action_fabric.flow_action'
    };

    function extractFilters(filters) {
        const result = { client: '', table: '' };
        if (!filters) return result;
        filters.forEach(filter => {
            const observability = filter.apply_to && filter.apply_to[0] && filter.apply_to[0].payload &&
                filter.apply_to[0].payload.observability;
            if (observability === CLIENT_FIELD && filter.values && filter.values[0])
                result.client = filter.values[0];
            if (observability === TABLE_FIELD && filter.values && filter.values[0])
                result.table = filter.values[0];
        });
        return result;
    }

    function formatTimestampRange(timestampRaw) {
        const ts = Number(timestampRaw);
        const date = new Date(ts);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        return {
            startTime: `${formattedDate} 00:00:00`,
            endTime: `${formattedDate} 23:59:59`
        };
    }

    const { data } = event.payload;
    const listId = event.elementId;

    // this assumes each series point carries its own id/value directly (e.g. the
    // client name or table name string), not a sys_id needing a lookup like the
    // reference script's sys_user/oauth_entity case.
    const element = data.elements && data.elements[0];
    const seriesValue = element && (element.id || element.key || element.value);

    const metricName = CHART_METRIC[listId] || 'sn.glide.action_fabric.record_action';
    const isFlow = metricName === 'sn.glide.action_fabric.flow_action';

    // ---- Flow charts carry their own filter state (flowAccessFilterConfigurations /
    // flowAccessParFilters), separate from Record Access's — read/send whichever one
    // actually matches the chart that was clicked.
    const { parFilters = [], flowAccessParFilters = [], filterConfigurations, flowAccessFilterConfigurations } = api.state;
    const activeParFilters = isFlow ? flowAccessParFilters : parFilters;
    const activeFilterConfigurations = isFlow ? flowAccessFilterConfigurations : filterConfigurations;

    const { client, table } = extractFilters(activeParFilters);

    const groupField = CHART_GROUP_FIELD[listId];
    let query = '';
    if (groupField && seriesValue)
        query += `&${groupField}=${seriesValue}`;
    if (client) query += `&${CLIENT_FIELD}=${client}`;
    if (table) query += `&${TABLE_FIELD}=${table}`;

    const tym = data.timestampRaw;
    const { startTime, endTime } = formatTimestampRange(tym);

    api.emit('NAV_ITEM_SELECTED', {
        route: 'action-fabric-list-page',
        fields: {
            listId,
            title: event.payload.title
        },
        params: {
            filters: `element=${element ? element.id || element.key || '' : ''}${query}`,
            start: startTime,
            endtime: endTime,
            filterConfigurations: activeFilterConfigurations,
            metricName: metricName
        }
    });
}
