function handler({
    api,
    helpers,
    event,
    imports
}) {
    const { table: tableName, sys_id  } = event.payload;
    let route = null;
    let icon = 'info-circle-outline';
    let fields = {
        sysId: event.payload.sys_id,
    };
    if(tableName === 'pa_dm_kpi_configuration'){
        route = 'kpi-details';
        icon = 'kpi-outline';
        fields = {
            dataSourceId: event.payload.sys_id,
            dataSource: 'analyticalmodel',
        }
    } else if(tableName === 'pa_dm_analytics_source'){
        route = 'analytics-source-edit';
        icon = 'database-fill';
    }
    if(route)
        api.emit('NAV_ITEM_SELECTED', {
            route,
            icon,
            fields
        });
}
