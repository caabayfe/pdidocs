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
    if (event.payload.value.props_details.triggersave == "true") {
        api.data.gform.save();
        api.emit('ACE_ACTION_PERFORMED', {
            eventName: 'SOW_ADMIN_CENTER_GFORM_SAVE_ATTEMPTED',
            eventPayload: {
                table: api.data.gform.nowRecordFormBlob.table,
                sysId: api.data.gform.nowRecordFormBlob.sysId
            }
        });
    }
}
