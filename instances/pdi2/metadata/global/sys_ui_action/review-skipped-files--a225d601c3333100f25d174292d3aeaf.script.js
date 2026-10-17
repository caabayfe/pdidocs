displayList();
function displayList() { 
	var historyLog = "sys_upgrade_history_log_list.do?sysparm_query=";
	var redirect = historyLog + "upgrade_history=" + current.sys_id + "^disposition=4^resolution_statusNOT INreviewed,reviewed_merged,reviewed_retained,reviewed_reverted^GROUPBYtype_priority^ORDERBYtype_priority";
	action.setRedirectURL(redirect);
}
