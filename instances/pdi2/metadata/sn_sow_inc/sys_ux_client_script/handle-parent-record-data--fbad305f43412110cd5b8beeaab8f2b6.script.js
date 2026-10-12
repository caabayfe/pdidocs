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
    var targetRecordFields = sowRemediateServerPlaybookConfig.getTargetRecordFields(api.state.targetTable);
    api.setState("targetRecordFields", targetRecordFields);
    var record = api.data.parent_record.output.data.GlideRecord_Query[api.context.props.parentTable]._results[0];
    var ci = record.target_record_id;
    var fieldValueMap = api.state.fieldValueMap;
    if (fieldValueMap && fieldValueMap.cmdb_ci) {
        fieldValueMap.cmdb_ci.value = ci.value;
        fieldValueMap.cmdb_ci.displayValue = ci.displayValue;
    }
    var targetSysId = record.action_record_id.value;
    api.setState("targetSysId", targetSysId);
    api.setState("fieldValueMap", JSON.parse(JSON.stringify(fieldValueMap)));
}
