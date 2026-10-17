/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const titleName = api.state.popoverTemplate.event.title;
    if (!titleName || titleName.trim() === "" || !api.state.popoverTemplate.event.readAllowed)
        return true;
    else
        return false;
}
