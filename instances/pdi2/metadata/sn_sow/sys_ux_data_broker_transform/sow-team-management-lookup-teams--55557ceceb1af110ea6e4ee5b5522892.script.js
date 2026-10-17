function transform(input) {
	return new sn_sow.SOWTeamManagement().getTeams(
		input.encodedQuery,
		input.searchTerm,
		input.orderBy,
		input.sortType,
		input.rowLimit,
		input.currentPage,
		input.queryCategory
		);
}
