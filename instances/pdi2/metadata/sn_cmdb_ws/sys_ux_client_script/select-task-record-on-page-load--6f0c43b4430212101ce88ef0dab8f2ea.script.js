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
    const {
        taskId
    } = api.context.props;
    
    if (taskId) {
        let selectedRecords = [taskId];
        api.setState("selectedTestRecords", selectedRecords);
        api.setState("testSelectedCount", selectedRecords.length);
    }
}
