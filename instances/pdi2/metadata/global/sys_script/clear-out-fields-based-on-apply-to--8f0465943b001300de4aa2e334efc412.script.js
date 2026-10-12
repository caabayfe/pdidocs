(function executeRule(current, previous /*null when async*/) {
	var type = current.type.toString();
	//clear out fields that are inappropriate based on chosen type
	switch(type){
		case "All":
			current.user = "";
			current.role = "";
			break;
		case "User":
			current.role = "";
			break;
		case "Role":
			current.user = "";
			break;
		default:
			break;
	}
})(current, previous);
