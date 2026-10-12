function transform(input) {
	const { table, sysId } = input;
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_explore_ci", "Get CI header info", function() {
		let result = {
			name: "",
			icon: "",
			classDisplayValue: "",
			sysClassName: "",
			hasIRERules: false
		};

		if(gs.nil(table) || gs.nil(sysId))
			return result;

		const util = new sn_cmdb_ws.CMDBWorkspaceUtil();
		const exploreCIService = new sn_cmdb_ws.CMDBWsExploreCIService();
		const gr = CMDBWsGlideUtils.getGrBySysId(table, sysId, true);

		if(gr) {
			const recordClassName = gr.getRecordClassName();
			result.name = gr.getDisplayValue() || gs.getMessage('<No name>');
			result.classDisplayValue = gr.getClassDisplayValue();
			result.sysClassName = recordClassName;
			result.hasIRERules = global.JSUtil.notNil(exploreCIService.getIdentificationRules(recordClassName));
		}
		result.icon = util.getTableIcon(table);
		return result;
	});
}
