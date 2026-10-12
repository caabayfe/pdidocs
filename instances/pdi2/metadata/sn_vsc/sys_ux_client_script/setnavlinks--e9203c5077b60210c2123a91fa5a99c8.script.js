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
    var route = null;
    var fields = null;
    var params = null;
    const allSettingsUrl = '/now/security-center-configuration/all_settings/compliance_status=non-compliant^ORDERBYDESCscore_impact';
    const customerActionsLanding = '/now/security-center-configuration/customer_actions';
    const metricThresholdForMe = '/sn_vsc_metric_threshold_event_list.do?sysparm_query=userISNOTEMPTY%5Esys_created_onONToday%40javascript%3Ags.beginningOfToday()%40javascript%3Ags.endOfToday()%5Eis_current_user%3Dtrue&sysparm_view=';
    const metricThresholdForEveryone = '/sn_vsc_metric_threshold_event_list.do?sysparm_query=userISEMPTY%5Esys_created_onONToday%40javascript%3Ags.beginningOfToday()%40javascript%3Ags.endOfToday()&sysparm_view=';
    const classifiedData = '/now/security-center-monitoring/sc_kp_details/24e7e714435102102f66d069a7b8f2a2/m2m_dictionary_dataclass/Classified%20data/ORDERBYDESCsys_created_on/sys_dictionary%2Cdata_class%2Csys_created_on';
    var navLinkObj = {
        // metricId : navigationLink
        "ZEdGaWJHVnpibDkyYzJOZmJXVjBjbWxqWDNSb2NtVnphRzlzWkY5bGRtVnVkREUzTVRjMU5EVTJPVGMyTkRNPTE3MTc1NDU3MDAyOTk=" : metricThresholdForMe,
        "ZEdGaWJHVnpibDkyYzJOZmJXVjBjbWxqWDNSb2NtVnphRzlzWkY5bGRtVnVkREUzTVRjMU5EVTRNRFEyTWpBPTE3MTc1NDU4MDUyMzE=" : metricThresholdForEveryone,
        "ZEdGaWJHVnpibDlqY21sMGFXTmhiRjkxY0dSaGRHVXhOekUzTlRJek5UVXlPVEEyMTcxNzUyMzU1NjA0Ng==" : customerActionsLanding,
        "ZEdGaWJHVnRNbTFmWkdsamRHbHZibUZ5ZVY5a1lYUmhZMnhoYzNNeE56RTNNRE15T1RVME5ESXkxNzE3MDMyOTU3MTQw" : classifiedData
    };
    if (event.payload != undefined) {
        if (event.payload.table == 'sn_vsc_instance_hardening_settings') {
            navItemSelected(allSettingsUrl);
        } else if (event.payload.params != undefined && event.payload.params.indicatorSysid == undefined){
            console.log(event.payload.params.indicatorSysid);
            var metricID = event.payload.params.metricId;
            if (navLinkObj.hasOwnProperty(metricID)) {
                navItemSelected(navLinkObj[metricID]);
            }
        } else if (event.payload.eventOrigin == 'NOW_RECORD_LIST_CONNECTED#VIEW_ALL_CLICKED') {
            var externalUrl = '';
            var linkObj = {
                "sn_vsc_mi_hardening_score": "/sn_vsc_mi_hardening_score_list.do",
                "sn_vsc_mi_alert_metrics": "/sn_vsc_mi_alert_metrics_list.do",
                "sn_vsc_mi_upgrade_versions": "/sn_vsc_mi_upgrade_versions_list.do",
                "sn_vsc_mi_data_protection_metrics": "/sn_vsc_mi_data_protection_metrics_list.do",
                "sn_vsc_mi_login_protection_metrics": "/sn_vsc_mi_login_protection_metrics_list.do",
                "sn_vsc_mi_user_metrics": "/sn_vsc_mi_user_metrics_list.do"
            };
            if (event.payload != undefined) {
                var tableVal = event.payload.table;
                if (linkObj.hasOwnProperty(tableVal)) {
                    externalUrl = linkObj[tableVal];
                }
                navItemSelected(externalUrl);
            }
        } else {
            var indicatorId = event.payload.params.indicatorSysid;
            var res = api.data.get_si_dashboard_kpi_page_params_1.output;
            if (res != null) {
                var pageParams = res[indicatorId];
                if (pageParams != null) {
                    route = pageParams.route;
                    fields = pageParams.fields;
                    if (route != undefined && fields == undefined) {
                        navItemSelected('/now/security-center-configuration/' + route);
                    } else if (fields.listTable != undefined && fields.listTitle != undefined && fields.listFilter != undefined && fields.listSort != undefined && fields.listColumns != undefined) {
                        navItemSelected('/now/security-center-monitoring/' + route + '/' + indicatorId + '/' + fields.listTable + '/' + fields.listTitle + '/' + fields.listFilter + '/' + fields.listSort + '/' + fields.listColumns);
                    } else if (fields.listTable != undefined && fields.listTitle != undefined && fields.listFilter == undefined) {
                        navItemSelected('/now/security-center-monitoring/' + route + '/' + indicatorId + '/' + fields.listTable + '/' + fields.listTitle + '/' + fields.listSort + '/' + fields.listColumns);
                    } else {
                        navItemSelected('/now/security-center-monitoring/' + route + '/' + indicatorId);
                    }
                }
            }
        }
    }

    function navItemSelected(targetUrl) {
        api.emit('NAV_ITEM_SELECTED', {
            external: {
                url: targetUrl,
                "target": "_self"
            }
        });
    }
}
