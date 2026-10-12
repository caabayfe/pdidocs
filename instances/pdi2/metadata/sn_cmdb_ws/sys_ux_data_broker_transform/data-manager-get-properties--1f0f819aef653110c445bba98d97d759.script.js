function transform(input) {
    var wrapperFn = function() {
        var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        var properties = proxy.getPropertiesNameAndValue();
        return properties;
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get DM properties name and value", wrapperFn);
}
