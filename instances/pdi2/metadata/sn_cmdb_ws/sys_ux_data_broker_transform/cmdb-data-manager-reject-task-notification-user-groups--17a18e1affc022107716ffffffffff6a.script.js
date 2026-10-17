function transform(input) {

    var wrapperFn = function() {
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
        return proxy.getUserGroups(input.SearchPrefix);
    };
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get User Groups for Reject Task Notifications", wrapperFn);
}
