function transform(input) {
    var wrapperFn = function() {
		var properties = input.properties;
        var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        proxy.resetToDefaultProperties(properties);
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager Reset to Default Properties", wrapperFn);
}
