/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const payload = {
        feature: 'record',
        fields: {
            table: api.context.props.table,
            sysId: api.context.props.sysId
        },
        fallbackRoute: {
            context: {
                experienceName : 'Unified Navigation App',
                path: 'now/nav/ui'
            },
            route: 'classic',
            params: {
                target: `${api.context.props.table}.do?sys_id=${api.context.props.sysId}`
            }
        } 
    };
    api.emit('GLOBAL_NAVIGATION_REQUESTED', payload);
}
