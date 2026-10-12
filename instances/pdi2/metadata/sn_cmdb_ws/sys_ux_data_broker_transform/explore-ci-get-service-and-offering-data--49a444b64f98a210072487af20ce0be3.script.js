function transform(input) {
	const { table, sysId } = input;
    
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Get service and offering", function() {
        return {
			serviceAndOffering: new sn_cmdb_ws.CMDBWsExploreCIService().getServiceAndOffering(table, sysId),
			lastUpdatedText: sn_i18n.Message.getMessage('sn_cmdb_ws', 'Last update: {0}', { 0: new GlideDateTime().getDisplayValue()})
		};
    });
}
