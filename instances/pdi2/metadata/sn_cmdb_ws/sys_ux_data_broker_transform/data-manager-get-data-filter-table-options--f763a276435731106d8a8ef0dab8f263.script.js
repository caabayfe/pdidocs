function transform(input) {
    var wrapperFunction = function() {
        var term = input.searchTerm;
		var policyType = input.policyType;
		var currentValue = input.currentValue;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		return proxy.searchDataFilterTableOptions(term, policyType, currentValue);
    };

    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager - Search Data Filter Table Options", wrapperFunction);
}
