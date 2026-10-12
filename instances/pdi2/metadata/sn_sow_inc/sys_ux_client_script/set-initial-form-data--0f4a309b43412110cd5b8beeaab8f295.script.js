/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const sowRemediateServerPlaybookConfig = imports['sn_sow_inc.SowRemediateServerPlaybookConfig']();
    var fields = api.data.gform.nowRecordFormBlob.fields;
    var fieldValueMap = sowRemediateServerPlaybookConfig.getFormFields(api.state.targetTable, api.state.view, fields);
    api.setState("fieldValueMap", fieldValueMap);
    api.data.parent_record.refresh();
    api.setState("hasError", false);
    var formInvalid = false;
    for (var field in fieldValueMap) {
        if (fieldValueMap[field].visible && fieldValueMap[field].mandatory && (!fieldValueMap[field].value || fieldValueMap[field].value == "")) {
            formInvalid = true;
            api.setState("isFormInvalid", true);
            break;
        }
    }
    if (!formInvalid) {
        api.setState("isFormInvalid", false);
    }
    api.data.validate_change_model.execute();
}
