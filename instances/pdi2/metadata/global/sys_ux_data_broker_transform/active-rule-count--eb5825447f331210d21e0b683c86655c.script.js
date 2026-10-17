function transform(input) {
	var api = new sn_data_management_console.RulesAPI();
	return JSON.parse(api.getActiveRulesCount());
}
