/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    return api.emit('GLOBAL_NAVIGATION_REQUESTED', { 
        targetExperience:{ lastVisited: true},
        feature: 'record',
        fields: {
            table: event.payload.recordTable || event.payload.table,
            sysId: event.payload.sys_id || event.payload.sysId,
            target: `${event.payload.recordTable || event.payload.table}.do?sys_id=${event.payload.sys_id || event.payload.sysId}`
        },
        fallbackRoute: { 
        context: { 
            	experienceName: 'Unified Navigation App',
	            path: 'now/nav/ui'
        },
        route: 'classic',
        params: {
            target: `${event.payload.recordTable || event.payload.table}.do?sys_id=${event.payload.sys_id || event.payload.sysId}`
        }
        }
    });
}
