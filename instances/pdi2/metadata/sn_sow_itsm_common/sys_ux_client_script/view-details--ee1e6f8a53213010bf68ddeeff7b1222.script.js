/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    imports
}) {
    api.emit('SCREEN_STATUS_CHANGED', {
        status: 'closed',
        skipNextScreenActivation: true
    });

    const {
        parent_sys_id,
        table,
        sysId,
        title,
        query
    } = event.payload;
    let targetRoute = '';
    if (parent_sys_id)
        targetRoute = 'current';

    let payload = {
        route: 'record'
    };
    payload.fields = {
        table,
        sysId
    };
    payload.targetRoute = targetRoute;
    payload.title = title;
    payload.query = query;
    if(query)
       payload.params = { query: query } ;

    api.emit('NAV_ITEM_SELECTED', payload);
}
