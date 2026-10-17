function transform(input) {
	var result = {
		errors: [],
		relatedLists: []
	};
	
	try {
		var workspaceId = input.workspaceId;
		var configIdentifierId = input.configIdentifierId;
		var response = new UnifiedMapHelper().getRelatedItemCategories(workspaceId, configIdentifierId);
		if (!response.success) {
			result.errors.push('There was an error fetching the related item categories. ' + response.error.message);
		} else if (response.result.length === 0) {
			// No categories found for this configuration (not a failure)
			return result;
		} else {
			result.relatedLists = response;
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
