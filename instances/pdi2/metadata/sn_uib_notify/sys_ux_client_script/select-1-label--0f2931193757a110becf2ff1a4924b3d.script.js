/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.type == "sendSms")
        return helpers.translateSync("From number");
    else
        return helpers.translateSync("Conference bridge");
}
