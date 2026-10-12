/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var taskDescription = api.item?.value?.short_description || "";
    if (taskDescription && taskDescription.length > 40)
        return taskDescription.substring(0, 40) + "..."; //Truncate and add ellipsis
    return taskDescription;
}
