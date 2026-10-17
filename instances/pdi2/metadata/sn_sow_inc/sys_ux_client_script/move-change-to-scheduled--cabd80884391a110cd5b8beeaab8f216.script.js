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
    var obj = {
        "state": "Scheduled"
    };
    api.data.update_change_record.execute({
        sysId: api.state.targetSysId,
        keyValuePairs: obj
    });
}
