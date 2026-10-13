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
        startDate,
        endDate
    } = api.context.props;
    if (!startDate || !endDate) return null;
    return `last_conversationBETWEENjavascript:gs.dateGenerate('${startDate}','00:00:00')@javascript:gs.dateGenerate('${endDate}','23:59:59')`;
}
