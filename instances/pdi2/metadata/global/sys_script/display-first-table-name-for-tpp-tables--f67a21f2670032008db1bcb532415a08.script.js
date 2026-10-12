(function executeRule(current, previous /*null when async*/) {
	var td = GlideTableDescriptor.get(current.getValue("name"));
	var ed = td.getElementDescriptor(current.getValue("element"));
	if (ed == null || ed.isFirstTableName()) {
		return;
	}

	var url = "sys_dictionary.do?sysparm_query=name=" + ed.getFirstTableName() + "^element=" + ed.getName();
	var clickHereLink = '<a target="_blank" href="' + url + '">Click here</a>';
	var firstElement = ed.getFirstTableName() + "." + ed.getName();
	gs.addInfoMessage(gs.getMessage("This cloned descendant element is read-only, {0} to open editable first element ({1}) in a new window.",[clickHereLink,firstElement]));
})(current, previous);
