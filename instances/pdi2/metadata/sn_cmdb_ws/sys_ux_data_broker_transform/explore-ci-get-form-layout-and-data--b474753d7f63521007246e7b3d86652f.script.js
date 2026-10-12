function transform(input) {
    const {
        table,
        sysId,
        appId,
        configId
    } = input;

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Get form layout and data", function() {
        return new sn_cmdb_ws.CMDBWsExploreCIService().getFormLayoutAndData(table, sysId, appId, configId);
    });
}
