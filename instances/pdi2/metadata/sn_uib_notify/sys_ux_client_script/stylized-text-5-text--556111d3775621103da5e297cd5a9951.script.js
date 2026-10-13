/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let count = 0;
    if (api.context.props.type == "sendSms" && api.state.smsMaxLength) {
        count = api.state.smsMaxLength - api.state.message.length;
    } else {
        count = 160 - api.state.message.length;
    }
    const result = helpers.translateSync('Characters left: {0}', count);
    return result;
}
