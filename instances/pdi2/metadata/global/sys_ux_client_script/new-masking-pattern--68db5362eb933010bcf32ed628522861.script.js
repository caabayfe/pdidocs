/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

    try {
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' && event.payload.wrappedAction == 'CREATE_NEW_RECORD') {
                helpers.navigate.to('ci-record', { ...event.payload.wrappedPayload.fields,
                    "sysId": event.payload.wrappedPayload.fields.sysId == '-1' ? '-1_uid_' + Date.now() : event.payload.wrappedPayload.fields.sysId}, { ...event.payload.wrappedPayload.params
                });
        }
    } catch (e) {}

}
