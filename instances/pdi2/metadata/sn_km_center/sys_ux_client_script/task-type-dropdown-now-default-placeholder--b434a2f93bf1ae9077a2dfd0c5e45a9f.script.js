/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // If there is only one task type, display that task type.
    // If not, display "All"
    const taskTypes = api.data.fetch_knowledge_gaps_task_type_data.results;
    return taskTypes.length == 1 ? taskTypes[0].label : helpers.translateSync("All");
}
