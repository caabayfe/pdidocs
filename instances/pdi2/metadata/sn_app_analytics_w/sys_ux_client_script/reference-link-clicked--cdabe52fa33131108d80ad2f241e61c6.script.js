function handler({
    api,
    helpers,
    event,
    imports
}) {
    const {
        row,
        listTable,
        table, // reference record table
        sys_id // reference record sys_id
    } = event.payload;

    switch(table) {
        case 'snpar_sched_export_v_scheduled_export_visualization':
            // Navigate to scheduled-export page 
            api.emit('NAV_ITEM_SELECTED', {
                route: 'scheduled-export',
                title: row.displayValue.value,
                fields: {
                    sysId: row.sys_id.value
                },
            });
            break;
        case 'sys_report': 
            // Navigate to sys_report_template page
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: '/sys_report_template.do?jvar_report_id=' + sys_id
                }
            });
            break;
        case 'par_visualization': 
            // Navigate to visualization-designer page
            api.emit('NAV_ITEM_SELECTED', {
                route: 'visualization-designer',
                fields: {
                    sysid: sys_id
                },
            });
            break;
        default:
            // Navigate to corresponding platform record page 
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: '/' + table + '.do?sys_id=' + sys_id
                }
            });
            break;
    }

}
