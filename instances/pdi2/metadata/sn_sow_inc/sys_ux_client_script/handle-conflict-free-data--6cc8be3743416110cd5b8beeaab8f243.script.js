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
    api.setState("showConflictFreeProposal", false);
    if (event.payload.data && event.payload.data.output && event.payload.data.output.result) {
        var conflictFreeData = event.payload.data.output.result.spans;
        if (conflictFreeData && conflictFreeData.length > 0) {
            conflictFreeData = conflictFreeData[0];
            var linkLabel = conflictFreeData.start.display_value + " - " + conflictFreeData.end.display_value;
            api.setState("linkLabel", linkLabel);
            api.setState("conflictFreeData", conflictFreeData);
            api.setState("showConflictFreeProposal", true);
        }
    }
}
