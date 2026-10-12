/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const message = '% complete';
    const payload = api.context.props.payload;
    const payloadLength = payload && payload.length;
    if (payloadLength > 0) {
        const checklistItemPercentage = payload.reduce(function(totalPercentage, item) {
            totalPercentage = totalPercentage + item.percentage;
            return totalPercentage;
        }, 0);
        const percentComplete = (checklistItemPercentage / payloadLength);
        return percentComplete + message;
    }
    return 0 + message;
}
