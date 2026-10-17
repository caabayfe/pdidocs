/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    //show first scan result date and time
    if (api.state.scanDate1 != null && api.state.scanTime1 != null) {
        return api.state.scanDate1 + " " + api.state.scanTime1;
    } else if (api.state.firstAvailableDisplayDate && api.state.firstAvailableTime) {
        return api.state.firstAvailableDisplayDate + " " + api.state.firstAvailableTime;
    } else {
        return '';
    }
}
