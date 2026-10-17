(function executeRule(current, previous /*null when async*/) {
	if(gs.nil(current.element))
	{
		var name = current.label;
		if (name.indexOf(" ") >= 0) {
			name = name.replace(/ /g, "_");
		}
		var au = new global.ArrayUtil();
		var roles = gs.getUser().getRoles() + ''; 
		var roleArray = roles.split(","); 
		var hasRoleExactly = au.contains(roleArray, 'maint'); 

		if (!hasRoleExactly && name.substring(0,2) != "u_") {
			name = "u_" + name;
		}
		current.element = name.toLowerCase();
	}
})(current, previous);
