(function executeRule(current, previous /*null when async*/) {

	var serverUrl = current.getValue('url');
	
	if (serverUrl.indexOf(">") > -1 || serverUrl.indexOf("<") > -1) {
		gs.addErrorMessage(gs.getMessage("Invalid URL. Characters < and > are not allowed"));
        current.setAbortAction(true);
		gs.getSession().putProperty("dotest", "0");//don't run auto-test (show error msg)
	}

})(current, previous);
