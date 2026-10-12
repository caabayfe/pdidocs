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
    var eventName = event.name;
    if (eventName == "DE_DUP_TASKS#ASSOCIATE_TO_TEMPLATE") {
        helpers.navigate.to('edit-assigned-tasks', {}, {
            "query": api.state.selectedDedupeTaskRecordsQuery
        });
    } else if (eventName == "DE_DUP_ORPHAN_TASKS#ASSOCIATE_TO_TEMPLATE") {
        helpers.navigate.to('edit-assigned-tasks', {}, {
            "query": api.state.selectedDedupeTaskForOrphanRecordsQuery
        });
    }
}
