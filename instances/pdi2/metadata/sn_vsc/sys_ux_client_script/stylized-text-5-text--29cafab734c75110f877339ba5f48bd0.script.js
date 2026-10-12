/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    ////show second scan result date and time
    if (api.state.scanDate2 != null && api.state.scanTime2 != null) {
        return api.state.scanDate2 + " " + api.state.scanTime2;
    } else if (api.state.secondAvailableDisplayDate && api.state.secondAvailableTime) {
        return api.state.secondAvailableDisplayDate + " " + api.state.secondAvailableTime;
    } else {
        return '';
    }
}
