function hasGroup() {
	var userGroups = getMyGroups();
	var templateGroups = current.groups.split(',');
	return templateGroups.some(function(group) {
		return (userGroups.indexOf(group) != -1);
	});
	
}
answer = gs.hasRole(current.roles) || ( !current.groups.nil() && hasGroup());
