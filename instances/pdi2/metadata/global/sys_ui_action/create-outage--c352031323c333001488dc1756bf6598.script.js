createOutageM2M();

function createOutageM2M() {
	var url = "cmdb_ci_outage.do?sys_id=-1&sysparm_query=";
	url += encodeURIComponent("cmdb_ci=" + current.getValue("cmdb_ci") + "^task_number=" + current.getUniqueValue() + "^short_description=" + current.getValue("short_description") + "^EQ");

	action.setRedirectURL(url);
	action.setReturnURL(current);
}
