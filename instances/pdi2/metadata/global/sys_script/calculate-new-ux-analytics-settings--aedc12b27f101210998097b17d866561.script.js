(function executeRule(current, previous /*null when async*/ ) {
    if (sn_app_analytics.SNAnalytics.isEnabled()) {
      var channel = current.analytics_channel.name;
      var applicationSysId = current.app_sys_id;
      sn_app_analytics.SNAnalytics.insertNewConfigurationRecords(channel, applicationSysId, current.sys_id);
    }

})(current, previous);
