/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const type = api.context.props.type;
    let heading = "";
    if (type === "communicationTask") {
        heading = helpers.translateSync("Manage recipients");
    } else if (type === "collaborationTask") {
        heading = helpers.translateSync("Manage participants");
    }
    return heading;
}
