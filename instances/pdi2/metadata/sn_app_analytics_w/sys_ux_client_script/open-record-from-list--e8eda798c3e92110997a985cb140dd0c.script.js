function handler({
    api,
    helpers,
    event,
    imports
}) {
    const {
        routeMapping,
        buildDefaultRoutePayload
    } = imports["global.recordRoutesMapping"]();
    const {
        row,
        listTable,
        table,
        sys_id
    } = event.payload;
    switch (listTable) {
        case 'par_component_filter':
            api.emit('NAV_ITEM_SELECTED', {
                route: 'filter-designer',
                title: row.displayValue.value,
                fields: {
                    sysId: row.sys_id.value
                },
            });
            return;
            break;
        case 'snpar_sched_export_v_scheduled_export_visualization':
            if (table !== 'snpar_sched_export_v_scheduled_export_visualization') {
                if (table === 'sys_report') {
                    api.emit('NAV_ITEM_SELECTED', {
                        external: {
                            url: '/sys_report_template.do?jvar_report_id=' + sys_id
                        }
                    });
                } else if (table === 'par_visualization') {
                    api.emit('NAV_ITEM_SELECTED', {
                        route: 'visualization-designer',
                        fields: {
                            sysid: sys_id
                        },
                    });
                }
            } else {
                //we cannot navigate directly to sys_report as we do not know if this is a normal report due the us only being able to see the fields the user has chosen to display. The redirect to sys_report happens inside the scheduled export page
                api.emit('NAV_ITEM_SELECTED', {
                    route: 'scheduled-export',
                    title: row.displayValue.value,
                    fields: {
                        sysId: row.sys_id.value
                    },
                });
            }
            return;
            break;
    }
    var route = 'record';
    var targetRoute = '';
    const defaultRoutePayload = buildDefaultRoutePayload(route, targetRoute, event);

    const routeMap = api.data.dynamic_routing_list.routeMap;
    const payload = routeMapping(routeMap, defaultRoutePayload, event);

    // If a table name passed into trueupTable matches the existing table
    // refresh trueup DR to get real table name; otherwise use existing.
    if (api.state.routeParentTables && api.state.routeParentTables.split(',').find(table => table === payload.fields.table)) {
        api.setState('navigationPayload', payload);
        api.data.resolve_route_parent_tables.refresh();
    } else {
        api.emit('NAV_ITEM_SELECTED', payload);
    }

}
