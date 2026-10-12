function transform(input) {
	var filters = Object.keys(input.filters).length > 0 ? input.filters : '';
	return new CMDBWsDMCertDashboardUIProxy().getCertInstanceAggDataTotalCount(filters);
}
