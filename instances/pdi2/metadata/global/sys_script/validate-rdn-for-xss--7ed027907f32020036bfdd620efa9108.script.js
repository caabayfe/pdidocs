(function executeRule(current, previous /*null when async*/) {

	var rdn = current.getValue('rdn');
	
	if (rdn.indexOf(">") > -1 || rdn.indexOf("<") > -1) {
		gs.addErrorMessage(gs.getMessage("Invalid Starting search directory. Characters < and > are not allowed"));
        current.setAbortAction(true);
		gs.getSession().putProperty("dotest", "0");//don't run auto-test (show error msg)
	}

})(current, previous);
