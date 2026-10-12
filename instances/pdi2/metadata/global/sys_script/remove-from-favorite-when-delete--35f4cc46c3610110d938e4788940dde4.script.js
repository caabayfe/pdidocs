(function executeRule(current, previous /*null when async*/) {
	
	new global.VizDesignerUtil().removeVizFromUserPreferences((String)(current.sys_id));
	
})(current, previous);
