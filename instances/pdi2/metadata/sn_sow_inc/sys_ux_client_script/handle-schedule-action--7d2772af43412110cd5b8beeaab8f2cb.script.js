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
    var fieldValueMap = api.state.fieldValueMap;
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
