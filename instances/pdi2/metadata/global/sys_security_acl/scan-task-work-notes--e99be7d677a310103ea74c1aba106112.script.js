(function() {
	var roles = ["scan_user"];
	var userHasRole = roles.some(function(role) {
		return gs.hasRole(role);
	});

	return userHasRole || gs.getUserID() === current.getValue("assigned_to") ;
})();
