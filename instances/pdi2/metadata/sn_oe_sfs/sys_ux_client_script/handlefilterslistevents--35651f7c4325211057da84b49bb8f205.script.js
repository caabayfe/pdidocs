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
    try {
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
            helpers.navigate.to('mac-record', {
                'table': 'sys_cs_consumer_account_context',
                'sysId': -1,
            }, {"timestamp": Date.now()});
        }

        if (event.name == 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
            helpers.navigate.to('mac-record', {
                'table': 'sys_cs_consumer_account_context',
                'sysId': event.payload.sys_id,
            }, {"timestamp": Date.now()});
        }
    } catch (e) {

    }
}
