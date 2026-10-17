function transform(input) {
    var wrapperFn = function() {
        const instanceId = input.execution_id;
        if (!instanceId) {
            return {};
        }

        var uiProxy = new CMDBWsDMCertDashboardUIProxy();
        return uiProxy.getCertInstanceTaskDetails(instanceId);
    };

    return new CMDBWsDataBrokerHandler().execute("Get Certification tasks filter and count", "sn_cmdb_ws_dm", wrapperFn);
}
