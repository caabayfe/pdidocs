function onBefore(current, previous) {
	current.setAbortAction(true);
}

// VALID Action script:
// var url = new GlideURL("sys_script.do"); 
// url.addEncodedString("sys_id=-1"); 
// window.location = url.getURL();

// INVALID Action script
// window.location = "sys_script.do?sys_id=-1";
