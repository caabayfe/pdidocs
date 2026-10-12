/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const message = helpers.translateSync("Display order valid range is -1000 to 1000.");
    const formattedMessage = {
        "status": "critical",
        "content": message,
        "icon": "triangle-exclamation-outline"
    };
    if (api.state.activityForm.fields.displayOrder.invalid) {
      return [formattedMessage];
    }
    return [];
}
