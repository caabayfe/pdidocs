/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    const getFiltersObj = (filters) => {
        if (!filters) return {};
        const items = filters.split('&') || [];
        const obj = {};
        items.forEach(item => {
            const res = item.split('=');
            obj[res[0]] = res[1];
        });
        return obj;
    };

    function getPredicateComposition({ filters }) {
        const defaultConfig = {
            "predicate": {
                "predicateId": "ace56d3f-5292-45f8-9334-0280f3d55688",
                "type": "GROUPED_PREDICATE",
                "groupType": "AND",
                "predicates": []
            }
        };
        const getPredicate = (name, value) => ({
            "predicateId": "5674f1f5-912c-466a-8b8e-1ddf4b6fdfeb",
            "type": "SINGLE_PREDICATE",
            "predicateProperties": {
                "rowId": "5674f1f5-912c-466a-8b8e-1ddf4b6fdfea" + Math.random(100),
                "selectedProperty": name,
                "selectedOperator": ["equals_to"],
                "selectedValue": [value],
                "selectedComponentIdx": 0,
                "nestedLevel": 0,
                "parentRowId": "5674f1f5-912c-466a-8b8e-1ddf4b6fdfea",
                "shouldValidate": true,
                "tabFocus": "AND"
            }
        });
        if (filters) {
            const predicates = Object.entries(filters).map(([key, value]) => getPredicate(key, value));
            defaultConfig.predicate.predicates.push(...predicates);
        }
        if (defaultConfig.predicate.predicates.length > 0) return defaultConfig;
        return [];
    }

    // ---- Agentic Usage attribute keys — record_action and flow_action use
    // entirely different attribute names, not just renamed fields (confirmed
    // against raw telemetry: flow events have no record_action_type or
    // integration_user_type equivalent, and use flow_name/flow_integration_client
    // instead of table_name/integration_client).
    const RECORD_ACCESS_AF = {
        table:     'StringAttributes.sn.glide.action_fabric.table_name',
        baseTable: 'StringAttributes.sn.glide.action_fabric.base_table_name',
        action:    'StringAttributes.sn.glide.action_fabric.record_action_type',
        origin:    'StringAttributes.sn.glide.action_fabric.inbound_origin_type',
        client:    'StringAttributes.sn.glide.action_fabric.integration_client',
        userType:  'StringAttributes.sn.glide.action_fabric.integration_user_type'
    };

    const FLOW_AF = {
        flowName:   'StringAttributes.sn.glide.action_fabric.flow_name',
        complexity: 'StringAttributes.sn.glide.action_fabric.flow_complexity_bucket',
        origin:     'StringAttributes.sn.glide.action_fabric.flow_origin_type',
        client:     'StringAttributes.sn.glide.action_fabric.flow_integration_client'
    };

    const metricName = api.context.props.metricName;
    const isFlow = metricName === 'sn.glide.action_fabric.flow_action';
    const AF = isFlow ? FLOW_AF : RECORD_ACCESS_AF;

    const props = api.context.props.listId;
    const filters = getFiltersObj(api.context.props.filters);
    const { element } = filters;
    const predicates = { ...filters };
    delete predicates.element;

    // ---- Extract date params from URL
    const startTime = api.context.props.start;
    const endTime = api.context.props.endtime;

    if ((element || element == "") && element.toLowerCase() != 'other') {
        // ---- Drill-down list: group by the AF dimensions, show a count
        const projectionConfig = {
            default: isFlow ? [
                { key: AF.flowName, label: 'FlowName', type: 'string' },
                { key: AF.client,   label: 'Client',   type: 'string' }
            ] : [
                { key: AF.table,    label: 'Table',      type: 'string' },
                { key: AF.action,   label: 'ActionType', type: 'string' },
                { key: AF.client,   label: 'Client',     type: 'string' },
                { key: AF.userType, label: 'UserType',   type: 'string' }
            ]
        };

        const projections = projectionConfig[props] || projectionConfig.default;
        const groupBy = projections.map(p => p.label).join(',');

        api.setState('input', {
            ...api.state.input,
            projections,
            groupBy
        });
        api.setState('predicateComposition', getPredicateComposition({ filters: predicates }));
    } else {
        // ---- Group-by (bar) charts: single-dimension grouping
        let dim = { key: AF.client, label: 'Client' };
        if (!isFlow && props == 'vertical_bar_table')  dim = { key: AF.table,  label: 'Table' };
        else if (!isFlow && props == 'vertical_bar_action') dim = { key: AF.action, label: 'ActionType' };
        else if (isFlow && props == 'vertical_bar_flow') dim = { key: AF.flowName, label: 'FlowName' };

        api.setState('input', {
            groupBy: dim.label,
            projections: [{ key: dim.key, label: dim.label, type: 'string' }]
        });
        api.setState('predicateComposition', getPredicateComposition({ filters: predicates }));
    }

    // ---- Set date range to state
    api.setState('startTime', startTime);
    api.setState('endTime', endTime);

    // ---- Refresh data brokers
    api.data.otel_application_list_1.refresh();
    api.data.otel_get_list_count_1.refresh();
}
