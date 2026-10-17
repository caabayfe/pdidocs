/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({ api, event, helpers, imports }) {
    // Each OOB filter component on this dashboard is keyed by its own filterId
    // (set on the filter's "filterId" property in the composition) so this one
    // shared handler can tell which physical filter fired and which telemetry
    // attribute it should filter on.
    const OBSERVABILITY_KEY_BY_FILTER_ID = {
        '1jt6h3jp1q8nlrsj80pk': 'StringAttributes.sn.glide.action_fabric.table_name',
        'af_flow_name_filter': 'StringAttributes.sn.glide.action_fabric.flow_name'
    };

    const { appliedFilters = [] } = event.payload;
    const { filterConfigurations, parFilters } = api.state;
    let updatedFilterConfig = filterConfigurations ? [...filterConfigurations] : [];
    let uiFiltersUpdated = parFilters ? [...parFilters] : [];

    Object.entries(OBSERVABILITY_KEY_BY_FILTER_ID).forEach(([filterId, OBSERVABILITY_KEY]) => {
        const filter = appliedFilters.find(f => f.filterId === filterId);

        if (!filter || !filter.values || filter.values.length === 0) {
            // Filter cleared (or never present) — drop this filterId's entry from
            // both state lists. Matched by filterId, not apply_to/observability:
            // parFilters holds the raw filter payload from the component (no
            // apply_to shape), so matching on apply_to here would silently never
            // remove it.
            updatedFilterConfig = updatedFilterConfig.filter(fc => fc.filterId !== filterId);
            uiFiltersUpdated = uiFiltersUpdated.filter(f => f.filterId !== filterId);
            return;
        }

        // Both filter_2 (table) and filter_4 (flow) use a "table" source (pointed at
        // sys_db_object / sys_hub_flow respectively — needed for the OOB filter
        // component to work at all, see filter_2/datasource and filter_4/datasource).
        // That kind of source always reports the underlying record's sys_id as
        // filter.values, regardless of primaryKey. Since neither table_name nor
        // flow_name is a real reference field, the sys_id is resolved back to the
        // record's name server-side in TelemetryQueryAdaptorActionFabric
        // (_resolveObservabilityValues) rather than via a client-side REST call.
        const updatedFilter = {
            filterId,
            type: 'CHOICE',
            apply_to: [{ type: 'OBSERVABILITY', payload: { observability: OBSERVABILITY_KEY } }],
            values: filter.values
        };

        const cfgIdx = updatedFilterConfig.findIndex(fc => fc.filterId === filterId);
        cfgIdx > -1 ? (updatedFilterConfig[cfgIdx] = updatedFilter) : updatedFilterConfig.push(updatedFilter);

        const uiIdx = uiFiltersUpdated.findIndex(f => f.filterId === filterId);
        uiIdx > -1 ? (uiFiltersUpdated[uiIdx] = filter) : uiFiltersUpdated.push(filter);
    });

    api.setState('filterConfigurations', updatedFilterConfig.map((fc, i) => ({ ...fc, order: i })));
    api.setState('parFilters', uiFiltersUpdated.map((f, i) => ({ ...f, order: i })));
}
