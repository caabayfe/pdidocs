/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var selectedDateValue = event.payload.value;
    const formatedDate = new Date(selectedDateValue).toISOString().split('T');
    api.setState("selectedDatePickerFirstScan", formatedDate[0].toString());
    api.setState("firstScanDate", selectedDateValue.toString());
    api.data.vsc_get_time_for_scan_results_first_date_1.refresh({
        date: formatedDate[0].toString()
    });
    api.setState("firstSelectedId", "");
}
