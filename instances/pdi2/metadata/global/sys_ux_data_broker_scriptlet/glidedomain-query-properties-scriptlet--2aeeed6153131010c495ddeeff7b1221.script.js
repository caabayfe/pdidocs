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
	
	var result = [];
	
	var propertiesRecord = _safelyGet(input, "query.data.GlideDomain_Query");
	if (!propertiesRecord) {
		result.push("Properties transform error: invalid input param. Expected property 'query.data.GlideDomain_Query'");
		return result;
	}
	
	for (var key in propertiesRecord) {
		var property = propertiesRecord[key];
		result.push(property);
	}	
	
	return result.length == 1 ? result[0] : result;
}
