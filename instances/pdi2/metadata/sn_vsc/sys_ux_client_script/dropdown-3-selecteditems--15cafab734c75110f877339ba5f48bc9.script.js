/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var secondDropdownSelection = api?.data?.sc_get_user_assigned_comparison?.output[1];
    if (api.state.secondResultId != null && api.state.secondResultId != "") {
        return [api.state.secondResultId];
    }
    if (api.state.scanDate2 != null) {
        let arr = [];
        const dates = api?.data?.get_scan_suite_results_execution_dates_1?.output || [];
        for (let i = 0; i < dates.length; i++) {
            let date = dates[i];
            if (date.label === api.state.scanDate2 && date.time === api.state.scanTime2) {
                arr.push(date.id);
                break;
            }
        }
        return arr;
    } else if (api.state.secondSelectedId && api.state.secondSelectedId != null && api.state.secondSelectedId != "") {
        return [api.state.secondSelectedId];
    } else {
        return [secondDropdownSelection.id.toString()];
    }
}
