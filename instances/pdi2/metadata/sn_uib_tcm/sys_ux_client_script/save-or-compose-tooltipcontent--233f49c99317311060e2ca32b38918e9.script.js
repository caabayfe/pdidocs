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
        whenToSendCommunication
    } = api.state;
    if (whenToSendCommunication === "now") {
        return helpers.translateSync("Compose communication");
    } else if (whenToSendCommunication === "later") {
        return helpers.translateSync("Save");
    }
}
