/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.firstClickedDisplayDate != null && api.state.scanTime1 != null) {
        return [{
            "isDatabaseView": false,
            "allowRealTime": true,
            "label": "Scan Check",
            "sourceType": "table",
            "tableOrViewName": "scan_check_execution",
            "filterQuery": "result.sys_created_onON" + api.state.firstClickedDisplayDate + "@javascript:gs.dateGenerate('" + api.state.firstClickedDisplayDate + "','" + api.state.scanTime1 + "')@javascript:gs.dateGenerate('" + api.state.firstClickedDisplayDate + "','" + api.state.scanTime1 + "')",
            "reportSourceSysId": null,
            "id": "dGFibGVzbl9ycGFfZmRuX3Byb2Nlc3Nfam9iMTY0MzUyNjg2MTAwOQ=="
        }];
    } else {
        return [{
            "isDatabaseView": false,
            "allowRealTime": true,
            "label": "Scan Findings",
            "sourceType": "table",
            "tableOrViewName": "scan_check_execution",
            "filterQuery": "result.sys_created_onON" + api.state.firstAvailableDate + "@javascript:gs.dateGenerate('" + api.state.firstAvailableDate + "','" + api.state.firstAvailableTime + "')@javascript:gs.dateGenerate('" + api.state.firstAvailableDate + "','" + api.state.firstAvailableTime + "')",
            "reportSourceSysId": null,
            "id": "dGFibGVzbl9ycGFfZmRuX3Byb2Nlc3Nfam9iMTY0MzUyNjg2MTAwOQ=="
        }];
    }
}
