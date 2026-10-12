function transform(input) {
	var result = {
		suggestedRelationships: null,
		errors: []
	};
	try {
		var util = new sn_cmdb_ws.UnifiedMapHelper();
		var suggestedRelationships = util.getSuggestedRelationshipsByCi({
			parentCi: input.parentCi,
			childCi: input.childCi
		});
		result.suggestedRelationships = suggestedRelationships;
	}
	catch(error) {
		result.errors.push(gs.getMessage("Error loading suggested relationships, cause: {0}", error.toString()));
	}
	return result;
}
