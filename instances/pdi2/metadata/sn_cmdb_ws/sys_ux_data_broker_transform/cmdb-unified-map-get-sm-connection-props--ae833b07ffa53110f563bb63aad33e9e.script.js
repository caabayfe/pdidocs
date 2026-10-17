// returns array of edges with associate connection properties
function transform(input) {
	var result = {
		errors: [],
		edgePropsList: []
	};
	
	try {
		var edgeList = input.edgeList;
		if (!edgeList.edges || edgeList.edges.length === 0) {
			result.errors.push('edges is missing');
		}
		
		if (!result.errors.length) {
			var response = new UnifiedMapHelper().getSMConnectionDetails(edgeList);
			if (response.success) {
				result.edgePropsList = response.result;
			} else {
				result.errors.push(response.error.message);
			}
		}
		
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
