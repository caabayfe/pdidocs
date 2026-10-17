/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let kbNumber = '';
    if (api.context && api.context.props && api.context.props.kbNumber != null) {
        kbNumber = api.context.props.kbNumber;
    }

    return [{
        label: helpers.translateSync("Article ID"),
        value: {
            type: "string",
            value: kbNumber
        }
    }];
}
