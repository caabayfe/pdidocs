/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        selectedEntityCardId
    } = api.state;
    if (selectedEntityCardId.length > 1) {
        return helpers.translateSync("Deleting a parent entity will delete its child/reference entities.");
    } else {
        return helpers.translateSync("This can't be reversed.");
    }
}
