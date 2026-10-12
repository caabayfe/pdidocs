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
        const {
            navigateTo
        } = imports["sn_ace.ACERoutingUtils"]();
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
            navigateTo(api, {
                route: 'record',
                fields: {
                    ...event.payload.wrappedPayload.fields,
                    'sysId': event.payload.wrappedPayload.fields.sysId == '-1' ? '-1_uid_' + Date.now() : event.payload.wrappedPayload.fields.sysId
                },
                params: {
                    ...event.payload.wrappedPayload.params
                }
            });
        }
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#ROW_CLICKED') {
            navigateTo(api, {
                route: 'record',
                fields: {
                    ...event.payload.fields,
                    'sysId': event.payload.sys_id,
                    'table': event.payload.table
                },
                params: {
                    't': Date.now()
                }
            });
        }
    } catch (e) {
    }
}
