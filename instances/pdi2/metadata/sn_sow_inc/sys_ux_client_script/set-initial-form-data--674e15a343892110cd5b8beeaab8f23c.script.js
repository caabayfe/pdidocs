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
    const sowRemediateServerPlaybookConfig = imports['sn_sow_inc.SowRemediateServerPlaybookConfig']();
    var fields = api.data.glide_form_1.nowRecordFormBlob.fields;
    var fieldValueMap = sowRemediateServerPlaybookConfig.getFormFields(api.state.targetTable, api.state.view, fields);
    api.setState("fieldValueMap", JSON.parse(JSON.stringify(fieldValueMap)));
    if (api.context.props.activityState.value == "COMPLETE") {
        api.data.change_management_conflict_1.refresh();
    }
    var formInvalid = false;
    for (var field in fieldValueMap) {
        if (fieldValueMap[field].visible && fieldValueMap[field].mandatory && (!fieldValueMap[field].value || fieldValueMap[field].value == "")) {
            formInvalid = true;
            break;
        }
    }
    api.setState("isFormInvalid", formInvalid);
}
