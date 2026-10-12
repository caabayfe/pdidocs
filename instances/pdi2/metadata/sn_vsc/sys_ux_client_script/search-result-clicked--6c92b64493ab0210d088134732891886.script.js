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
    helpers,
    imports
}) {
    let table;
    let sysId;
    let url;
    const action = event.payload.action;
    if (action && action.actionDispatch && (action.actionDispatch === 'NAVIGATION' || action.actionDispatch === 'NAVIGATION_TO_PARENT_RECORD')) {
        table = action.actionPayload.table;
        sysId = action.actionPayload.sysId;
        url = action.actionPayload.url;
    } else {
        table = event.payload.actionPayload.table;
        sysId = event.payload.actionPayload.sysId;
        url = event.payload.actionPayload.url;
    }
    if (event.payload.model.table == 'sn_ace_content_block') {
        api.data.ace_fetch_search_result_route.execute({
            application_id: api.context.app.ace_application_id,
            search_result_block_id: event.payload.model.sysId
        });
    } else {
        //dispatch an event.
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'search_result_clicked',
            eventPayload: {
                table,
                sysId,
                url
            }
        });
    }
}
