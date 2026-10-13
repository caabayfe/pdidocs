(function executeRule(current, previous /*null when async*/) {
	gs.setRedirect(gs.generateURL(current.getTableName(), current.sys_id));
})(current, previous);
