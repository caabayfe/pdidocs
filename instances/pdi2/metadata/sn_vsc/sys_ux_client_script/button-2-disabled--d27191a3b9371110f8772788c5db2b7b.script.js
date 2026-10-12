/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedDatePickerFirstScan && api.state.selectedDatePickerFirstScan != "" && api.state.selectedDatePickerSecondScan && api.state.selectedDatePickerSecondScan != "" && api.state.firstScanTime && api.state.firstScanTime != "" && api.state.secondScanTime && api.state.secondScanTime != "") {
        return false;
    }
    return true;
}
