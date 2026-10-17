function transform(input) {
	const {
		relatedListsQuery,
		appId
	} = input;
	let util = new CMDBWorkspaceUtil();
	let service = new CMDBWsManualCreateCIService();
	let relatedLists = relatedListsQuery?.data?.GlideLayout_Query?.formLayout?.relatedLists || [];
	relatedLists.forEach((relatedList) => {
		const {
			targetTable
		} = relatedList;
		if (util.isCMDBTable(targetTable) && service.classHasValidIdentificationRules(appId, targetTable)) {
			relatedList.newRecordRoute = 'manual-create-ci';
		} else {
			relatedList.newRecordRoute = 'record';
		}
	});
	return relatedLists;
}
