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
        startDateDay,
        endDateDay,
        formattedStart,
        formattedEnd
    } = api.state.popoverTemplate.event;
    if (formattedStart && formattedEnd) {
        if (endDateDay > startDateDay)
            return formattedStart + ' - ' + formattedEnd;
        else if (endDateDay == startDateDay)
            return formattedStart + ' - ' + formattedEnd.substring(10);
    }
}
