/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.allDay)
        return api.context.session.user.dateTimeFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
    else
        return api.context.session.user.dateFormat.replaceAll('d', 'D').replaceAll('y', 'Y');
}
