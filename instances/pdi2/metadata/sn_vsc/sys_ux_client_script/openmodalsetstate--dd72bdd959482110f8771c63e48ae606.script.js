/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState("selectedDatePickerFirstScan", "");
    api.setState("selectedDatePickerSecondScan", "");
    api.setState("firstScanTime", "");
    api.setState("secondScanTime", "");
}
