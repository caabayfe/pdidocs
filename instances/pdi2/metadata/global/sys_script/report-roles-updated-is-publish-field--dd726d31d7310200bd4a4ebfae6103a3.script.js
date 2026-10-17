(function executeRule(current, previous /*null when async*/) {

	var roles = current.roles;
	var isPublished = false;

	if (roles !== null) {
		//check if we have the role public
		var n = roles.indexOf('public');
		if (n != -1)
			isPublished = true;
	}

	//set value of published
	current.is_published = isPublished;
	
	gs.debug("Business rule [Report roles updated - is_publish field], roles ='" + roles + "', is_published = " + isPublished);	
})(current, previous);
