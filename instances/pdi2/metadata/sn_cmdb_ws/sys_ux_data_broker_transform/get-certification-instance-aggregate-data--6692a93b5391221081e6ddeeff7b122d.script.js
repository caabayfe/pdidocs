function transform(input) {
	const {filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize} = input;
	return new CMDBWsDMCertDashboardUIProxy().getCertInstanceAggData(filters, sortByField, isDesc, lastRowIdentifier, lastRowSysId, pageSize);
}
