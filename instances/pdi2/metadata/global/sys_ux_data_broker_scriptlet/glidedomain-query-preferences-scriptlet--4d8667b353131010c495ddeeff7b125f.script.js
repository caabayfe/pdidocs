function transform(input) {
	var envLogger = scriptlet;	
	
	function _safelyGet(obj, dotPath) {
		if (typeof(obj) !== "object" || typeof(dotPath) !== "string") {
			envLogger.print("Properties transform error: invalid input for path '" + dotPath + "' (type: " + typeof(dotPath) + ")");
			return null;
		}
		var foundProp = obj;
		var path = dotPath.split(".");
		for (var i = 0; i < path.length; i++) {
			if (!foundProp[path[i]]) 
				return null;
			
			foundProp = foundProp[path[i]];
		}
		return foundProp;
	}
	
	var result = {};
	
	var userRecord = _safelyGet(input, "query.data.GlideDomain_Query.user");
	if (!userRecord) {
		result.push("Preferences transform error: invalid input param. Expected property 'query.data.GlideDomain_Query.user'");
		return result;
	}
	
	for (var key in userRecord) {
		var val = userRecord[key];
		// weird scenario - GraphQL GlideDomain for user preferences can 
		// return a size 1 array that's effectively empty
		if (key == "preferences" && val && val.length == 1 && val[0].name == "")
			val = [];
		
		result[key] = val;
	}	
	
	return result;
}
