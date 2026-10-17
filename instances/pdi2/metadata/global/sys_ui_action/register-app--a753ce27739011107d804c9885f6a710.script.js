var applicationStatus = new UXMetricsApplications().registerApp({
    tableName: current.getTableName(),
    sysId: current.sys_id,
    channel: current.channel,
    appType: current.app_type
});

if (applicationStatus && applicationStatus.error) {
    gs.addErrorMessage(gs.getMessage("Unable to register application with appsee, {0}", applicationStatus.error));
} else if (sn_app_analytics.SNAnalytics.isApplicationRegistered(current.getTableName(), current.sys_id)) {
    gs.addInfoMessage("Application successfully registered with appsee");
}
action.setRedirectURL(current);
