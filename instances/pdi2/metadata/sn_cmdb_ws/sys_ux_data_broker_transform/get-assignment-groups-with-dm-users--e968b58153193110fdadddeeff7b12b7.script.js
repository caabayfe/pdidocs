function transform(input) {
	var wrapperFn = function() {
		var term = input.searchTerm;
		var proxy = new sn_cmdb_ws.CMDBWsDMPolicyUIProxy();
		var groups = proxy.getDataManagerUserGroups(term);
		var options = [{'id': -1, 'label': sn_i18n.Message.getMessage("sn_cmdb_ws", "Search for a assignnment group (3 characters minimum)")}];
		for (var i = 0; i < groups.length; i++) {
			options.push({
				"id": groups[i].value,
				"label": groups[i].name
			});
		}
		return options;
	};

	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get assignment groups with DM users", wrapperFn);
}
