/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const cell = event.payload.cell || {};
    if (cell.origin === 'REPORT') {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
				url: `/sys_report_template.do?jvar_report_id=${cell.sys_id}`
			}
        });
    } else {
        api.emit('NAV_ITEM_SELECTED', {
            route: 'visualization-designer',
            title: 'Visualization Designer',
            fields: {
                // sysId is undefined when user clicks "New" button on viz library
                sysid: cell.sys_id || 'new' + Date.now()
            }
        });
    }
}
