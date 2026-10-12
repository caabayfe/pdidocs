(function (current, action) {
	var newModelSysId = new STTRMModel(current).copy();
	var newModelURL = current.getValue("sys_class_name") + ".do?sysparm_nostack=true&sysparm_ignore_class=true&sys_id=" + newModelSysId;
	action.setRedirectURL(newModelURL);
})(current, action);
