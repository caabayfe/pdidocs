function onDisplay(current, g_scratchpad) {
	var td = GlideTableDescriptor.get(current.getTableName());
	var ed = td.getElementDescriptor('action_script');
	gs.addErrorMessage(gs.getMessage('Fix the {0} by using GlideURL to set the location', [ed.getLabel()]));
}

// VALID Action script:
// var url = new GlideURL("sys_script.do"); 
// url.addEncodedString("sys_id=-1"); 
// window.location = url.getURL();

// INVALID Action script
// window.location = "sys_script.do?sys_id=-1";
