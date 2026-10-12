/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    console.log(event);
    api.emit('NAV_ITEM_SELECTED', {
        route: 'record',
        fields: {
            aceAppConfigId: api.context.props.aceAppConfigId,
            table: event.payload.table,
            sysId: event.payload.sys_id
        },
        redirect: true
    });
}
