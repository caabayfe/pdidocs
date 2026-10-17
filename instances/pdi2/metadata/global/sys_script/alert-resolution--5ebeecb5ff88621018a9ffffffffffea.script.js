(function executeRule(current, previous /*null when async*/ ) {
    var type = typeof sn_em_ai.EvtMgmtAlertResolution;

    // immediately return if the feature flag is disabled 
    if ((gs.getProperty("evt_mgmt.enable_alert_resolution", "true") == "false") || (type == "undefined")) {
        return;
    }
    var resolution = new sn_em_ai.EvtMgmtAlertResolution();
    resolution.onAlertUpdate(current, previous);

})(current, previous);
