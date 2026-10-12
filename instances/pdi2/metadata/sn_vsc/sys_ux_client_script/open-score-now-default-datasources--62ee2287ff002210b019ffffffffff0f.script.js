/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    //Get the logged-in user's roles
    const userRoles = api?.context?.session?.user?.roles || [];
    let metricFilter = '';

    //determine filter value based on roles
    if (userRoles.includes('admin') || userRoles.includes('sn_vsc.security_center_admin') || userRoles.includes('sn_vsc.task_manager') || userRoles.includes('sn_vsc.security_center_viewer')) {
        metricFilter = 'state=1';
    } else if (userRoles.includes('itil')) {
        metricFilter = 'state=1^assigned_toDYNAMIC90d1921e5f510100a9ad2572f2b477fe';
    }

    return [{
        "allowRealTime": true,
        "dataCategories": [
            "trend",
            "group",
            "simple"
        ],
        "filterQuery": metricFilter,
        "id": "dGFibGVzbl92c2Nfc2VjdXJpdHlfdGFzazE3Mzk3MzUzNzgwMzg=",
        "isDatabaseView": false,
        "label": "Security tasks",
        "preferredVisualizations": [
            "d24d53f60350de7a652caf3188a46ed2"
        ],
        "reportSourceSysId": null,
        "sourceType": "table",
        "tableOrViewName": "sn_vsc_security_task"
    }];
}
