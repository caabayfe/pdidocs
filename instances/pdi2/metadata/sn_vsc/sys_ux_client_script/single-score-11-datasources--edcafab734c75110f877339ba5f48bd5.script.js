/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.secondClickedDisplayDate != null && api.state.scanTime2 != null) {
        return [{
            "isDatabaseView": false,
            "allowRealTime": true,
            "label": "Scan Check",
            "sourceType": "table",
            "tableOrViewName": "scan_check_execution",
            "filterQuery": "result.sys_created_onON" + api.state.secondClickedDisplayDate + "@javascript:gs.dateGenerate('" + api.state.secondClickedDisplayDate + "','" + api.state.scanTime2 + "')@javascript:gs.dateGenerate('" + api.state.secondClickedDisplayDate + "','" + api.state.scanTime2 + "')",
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
            "filterQuery": "result.sys_created_onON" + api.state.secondAvailableDate + "@javascript:gs.dateGenerate('" + api.state.secondAvailableDate + "','" + api.state.secondAvailableTime + "')@javascript:gs.dateGenerate('" + api.state.secondAvailableDate + "','" + api.state.secondAvailableTime + "')",
            "reportSourceSysId": null,
            "id": "dGFibGVzbl9ycGFfZmRuX3Byb2Nlc3Nfam9iMTY0MzUyNjg2MTAwOQ=="
        }];
    }
}
