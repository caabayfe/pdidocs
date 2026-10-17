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
    let editableFields = api.data.gform.nowRecordFormBlob.gForm.getEditableFields();
    editableFields = editableFields.filter(function(field) {
        return !field.startsWith("annotation.");
    });
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SOW_ADMIN_CENTER_GFORM_DATA_FETCH_SUCCESS',
        eventPayload: {
            table: api.data.gform.nowRecordFormBlob.table,
            sysId: api.data.gform.nowRecordFormBlob.sysId,
            isEditable: editableFields.length > 0,
            gform: api.data.gform.nowRecordFormBlob.gForm
        }
    });
}
