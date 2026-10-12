/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var firstDropdownSelection = api?.data?.sc_get_user_assigned_comparison?.output[0];
    if (api.state.firstResultId != null && api.state.firstResultId != "") {
        return [api.state.firstResultId];
    } else if (api.state.scanDate1 != null) {
        let arr = [];
        const dates = api?.data?.get_scan_suite_results_execution_dates_1?.output;
        for (let i = 0; i < dates.length; i++) {
            let date = dates[i];
            if (date.label === api.state.scanDate1 && date.time === api.state.scanTime1) {
                arr.push(date.id);
                break;
            }
        }
        return arr;
    } else if (api.state.firstSelectedId && api.state.firstSelectedId != null && api.state.firstSelectedId != "") {
        return [api.state.firstSelectedId];
    } else {
        return [firstDropdownSelection.id.toString()];
    }
}
