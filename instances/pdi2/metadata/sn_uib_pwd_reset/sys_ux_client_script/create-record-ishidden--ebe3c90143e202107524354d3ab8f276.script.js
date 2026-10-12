/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.context.props.additionalInfo.recordInfo)
        return true;

    const table = api.context.props.additionalInfo.recordInfo.table;
    if (!table || (table !== 'incident' && table !== "interaction"))
        return true;

    return api.state.errorDetails.actions.createRecord.isHidden;
}
