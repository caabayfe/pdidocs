/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.context.props.additionalInfo.recordInfo || !api.context.props.additionalInfo.recordInfo.table)
        return null;
    return api.context.props.additionalInfo.recordInfo.table === "incident" ? helpers.translateSync("Create new child incident") : helpers.translateSync("Create new incident");
}
