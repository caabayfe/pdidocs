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
    var fieldValueMap = api.state.fieldValueMap;
    var conflictFreeData = api.state.conflictFreeData;
    fieldValueMap.start_date.value = conflictFreeData.start.display_value;
    fieldValueMap.end_date.value = conflictFreeData.end.display_value;
    api.setState("fieldValueMap", JSON.parse(JSON.stringify(fieldValueMap)));
    api.setState("showConflictFreeProposal", false);
    var keyValuePairs = {};
    for (var field in fieldValueMap) {
        if (fieldValueMap[field].visible && fieldValueMap[field].mandatory) {
            keyValuePairs[field] = fieldValueMap[field].value;
        }
    }
    api.data.update_change_record.execute({
        sysId: api.state.targetSysId,
        keyValuePairs: keyValuePairs,
    });
}
