(function executeRule(current, previous /*null when async*/ ) {
    if (sn_app_analytics.SNAnalytics.isEnabled()) {
    var channel = current.sys_analytics_app.analytics_channel.name;
    var applicationSysId = current.sys_analytics_app.app_sys_id;

    if (gs.nil(channel) || channel == "undefined" || channel === undefined) {
        gs.info("channel is undefined");
        return;
        }

    var platform = current.platform;
    sn_app_analytics.SNAnalytics.updateConfigRecordOnOverrideUpdate(channel, applicationSysId, current.sys_id, platform);
   }

})(current, previous);
