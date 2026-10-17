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
    api.setState("showLoader", false);
    if (api.state.initialFormLoad) {
        api.setState("initialFormLoad", false);
    } else if (event.payload.errors && event.payload.errors.length == 0) {
            api.emit('ACE_ACTION_PERFORMED', {
                eventName: 'SOW_ADMIN_CENTER_GFORM_SAVED',
                eventPayload: {
                table: api.data.gform.nowRecordFormBlob.table,
                sysId: api.data.gform.nowRecordFormBlob.sysId
            }
        });
    }
}
