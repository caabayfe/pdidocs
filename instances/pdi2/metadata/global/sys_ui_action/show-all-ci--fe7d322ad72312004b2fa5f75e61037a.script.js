var uri = action.getGlideURI();
var path = uri.getFileFromPath();
var url = generateUrl();
action.setRedirectURL(url);

function generateUrl() {
	var AND = "&";
	var url = "/$cmdb_group_show_all_ci.do?sysparm_collection=" + current.getTableName();
	url += (AND + "sysparm_collectionID=" + current.sys_id);
	url += (AND + "sysparm_stack=no");
	url += (AND + "sysparm_collectionType=manualGroup");
	
	return url;
}
