(function refineQuery(current, parent) {
    var timestamp = (new GlideDate()).getByFormat('yyyy-MM-dd HH:mm:ss');
    var saHashGR = new GlideRecord("sa_hash");
    saHashGR.addQuery('name', 'last_calculated_impact');
    saHashGR.query();
    if (saHashGR.next())
        timestamp = saHashGR.getValue('hash');
    var alertPanelManager = new sn_nocpit.AlertPanelManager();
    var alerts = JSON.parse(alertPanelManager.getAllAlertsForBsInMap(parent.sys_id, "", timestamp, 0, 'sn_priority', false)).alerts;
    var alertsSysIds = [];
    for (var i = 0; i < alerts.length; i++) {
        alertsSysIds.push(alerts[i].sysId);
    }
    current.addQuery("sys_id", "IN", alertsSysIds);
    var filterSecondaries = gs.getProperty("evt_mgmt.operator_workspace_alert_panel_filter_out_secondaries_alerts", "false");
    if (filterSecondaries === "true")
        current.addQuery("parent", "=", "");
})(current, parent);
