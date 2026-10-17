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
    var resultsData = api?.data?.get_scan_suite_results_execution_dates_1?.output || [];
    var arrayVal = "";
    var stringItems = JSON.stringify(event.payload.items);
    var arrayValue = JSON.parse(stringItems);
    if (arrayValue.length > 0) {
        arrayVal = arrayValue[arrayValue.length - 1];

        //Check id for More dates and return 
        if (arrayVal.id.toString() == "123") {
            return;
        }
        //set state for first scan date and time
        api.setState("firstResultId", arrayVal.id.toString());
        api.setState("firstScanDate", arrayVal.label.toString());
        api.setState("firstScanTime", arrayVal.sublabel.split(" | ")[0].toString());
        api.setState("firstScanResult", arrayVal.sublabel.split(" | ")[1].toString());
        api.setState("firstClickedId", arrayVal.id.toString());

    }
    api.setState("firstSelectedId", "");
}
