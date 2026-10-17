roTemplates();
function roTemplates() {
	var query = "global=true^ORuser=" + gs.getUserID() + "^ORgroups=javascript:gs.getUser().getMyGroups()";
	current.addEncodedQuery(query);
}
