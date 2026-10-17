function transform(input) {
    var uiProxy = new CMDBWsDMCertDashboardUIProxy();
    var result = {};
    if (!input.sysId)
        return result;

    var instanceId = input.sysId;
    var wrapperFunction = function() {
        var certInstanceAggData = uiProxy.getCertInstanceAggByInstanceIds(instanceId);
        if (certInstanceAggData[instanceId])
            return certInstanceAggData[instanceId];
        return {
            error: "This execution id does not exist.",
            display_error: sn_i18n.Message.getMessage("sn_cmdb_ws", "This certification instance no longer exists.")
        };
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Certification - Get Certification Instance Details", wrapperFunction);
}
