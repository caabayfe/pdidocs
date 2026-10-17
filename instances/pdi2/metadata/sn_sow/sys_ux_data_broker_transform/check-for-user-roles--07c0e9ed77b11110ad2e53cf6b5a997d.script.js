function transform(input) {
	var output = {};
	var roles = (input.roles || "").split(",");
	if(roles && roles.length > 0) {
		var size = roles.length;
		for(var i = 0; i < size; i++) {
			if(roles[i]) {
				output[roles[i]] = gs.hasRole(roles[i]);
			}
		}
	}
	return output;
}
