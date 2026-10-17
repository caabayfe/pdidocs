(function executeRule(current, previous /*null when async*/) {
	// Array with default standard claims
	var claims = ["aud", "sub", "iss"];
	var claimsGr = new GlideRecord("jwt_claim_validation");
	for (var i = 0; i < claims.length; i++) {
		claimsGr.initialize();
		claimsGr.setValue("jwt_provider", current.sys_id);
		claimsGr.setValue("name", claims[i]);
		claimsGr.insert();
	}
})(current, previous);
