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
    var parFiltersArray = [];
    var datesArray = api?.data?.get_scan_suite_results_execution_dates_1?.output || [];
    var selectedDatesArray = api?.data?.sc_get_user_assigned_comparison?.output || [];
    api.setState("firstDropdownListData", datesArray.slice(1));
    api.setState("secondDropdownListData", datesArray);

    selectedDatesArray.map((record, index) => {
        if (index == 0) {
            api.setState("firstAvailableDate", record.label);
            api.setState("firstAvailableDisplayDate", record.displayLabel);
            api.setState("firstAvailableTime", record.time);
            api.setState("firstAvailableResult", record.result);
        }
        if (index == 1) {
            api.setState("secondAvailableDate", record.label);
            api.setState("secondAvailableDisplayDate", record.displayLabel);
            api.setState("secondAvailableTime", record.time);
            api.setState("secondAvailableResult", record.result);
        }
    });
    var suiteId = api.state.selectedSuite;
    var firstDate = api.state.firstAvailableDate;
    var secondDate = api.state.secondAvailableDate;
    var firstTime = api.state.firstAvailableTime;
    var secondTime = api.state.secondAvailableTime;

    var firstScanResult = api.state.firstAvailableResult;
    var secondScanResult = api.state.secondAvailableResult;

    var firstDropdownDefaultSelection = api.data.sc_get_user_assigned_comparison.output[0];
    api.setState("firstScanDateTime", (firstDropdownDefaultSelection.label + " " + firstDropdownDefaultSelection.time).toString());
    api.setState("firstAvailableDisplayDate", firstDropdownDefaultSelection.displayLabel.toString());

    var resultFilter = "comparison_scn_comp=" + firstScanResult + "," + secondScanResult;
    var query = "comparison_scn_suite=" + suiteId + "^" + resultFilter;

    var secondDropdownDefaultSelection = api.data.sc_get_user_assigned_comparison.output[1];
    api.setState("secondScanDateTime", (secondDropdownDefaultSelection.label + " " + secondDropdownDefaultSelection.time).toString());
    api.setState("secondAvailableDisplayDate", secondDropdownDefaultSelection.displayLabel.toString());

    parFiltersArray.push({
        order: 10,
        type: "query",
        apply_to: ["sn_vsc_changed_scan_finding"],
        encoded_query: query
    });

    api.setState("parFilters", parFiltersArray);
}
