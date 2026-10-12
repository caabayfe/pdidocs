function transform(input) {
	var result = {
		errors: [],
		counts: [],
		sysids: []
	};
	
	try {
		var sysids = input.sysids;
		var workspaceId = input.workspaceId;
		var configIdentifierId = input.configIdentifierId;
		result.sysids = sysids;
		
		var response = new UnifiedMapHelper().getRelatedList(workspaceId, configIdentifierId);
		if (!response.success) {
			result.errors.push('There was an error fetching the preconfigured related lists. ' + response.error.message);
		} else if (response.result.length === 0) {
			// the user has chosen to hide all related items categories, return an empty result (not a failure)
			return result;
		}
		var tmpResult = new UnifiedMapHelper().getRelatedListAggregate(sysids, response.result);
		if (tmpResult.success) {
			result.counts = tmpResult.result;
			//modify this section to whatever it needs to be for related items panel
			result.counts = result.counts.map(function(item){
				return {
					"value": {
						"type": "string",
						"value": item.count
					},
					"name": item.name, //needed for caching
					"sysId": item.sys_id,
					"ariaLabel": item.ariaLabel
				};
			});
		} else {
			//TODO: map with user-friendly error messages WRT tmpResult.error.code
			result.errors.push(tmpResult.error.message);
		}
		
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
