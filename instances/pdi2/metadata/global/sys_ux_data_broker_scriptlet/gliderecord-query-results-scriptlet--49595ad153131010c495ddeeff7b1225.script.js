function transform(input) {
	var envLogger = scriptlet;	
	
	// depth first search for _results array field
	function _recursFindKey(obj, key) {
		if (typeof(obj) !== "object" || typeof(key) !== "string") {
			envLogger.print("Get Results transform error: invalid input for property " + key + " (type: " + typeof(key) + ")");
			return null;
		}
		for (var k in obj) {
			if (k == key) 
				return obj[k];
			
			var child = obj[k];
			if (typeof(child) !== 'object')
				continue;
			
			var result = _recursFindKey(child, key);
			if (result != null)
				return result;
		}
		return null;
	}
	
	var results = _recursFindKey(input.query, "_results");
	if (!results)
		return [ "Get Results transform error: invalid input param. Expected to find property '_results'" ];
	
	// un pack first item if array length == 1
	if (results.length == 1 && input.first == true) {
		var result = results[0];
		var tableMetadata = _recursFindKey(input.query, "_table_metadata");
		if (tableMetadata)
			result["_table_metadata"] = tableMetadata;
		return result;
	}
	
	return results;
}
