function transform(input) {
	var preferences = input.preferences.split(",");
	var workspaceId = input.workspaceId;
	var result = {};
	preferences.forEach(function(key) {
		var currentKey = key + "_" + workspaceId;
		var prefValue = gs.getUser().getPreference(currentKey);
		result[currentKey] = prefValue;
	});
	return result;
}
