function transform(input) {
    var wrapperFn = function() {
		var properties = input.properties;
        var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        proxy.updateProperties(properties);
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Update Data manager properties", wrapperFn);
}
