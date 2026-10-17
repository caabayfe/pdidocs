(function executeRule(current, previous) {
    var d = "directive";
	var gr = new GlideRecord("sp_angular_provider");    	
	gr.addQuery("name", current.getValue("name"));
    gr.addQuery("sys_id", "!=", current.getValue("sys_id")); //ignore self
	
	if (current.getValue("type") == d) {
		gr.addQuery("type", d);
	} else {
		gr.addQuery("type", "!=", d);
	}
	
    gr.query();
	
	if (gr.hasNext()) {			
		current.setAbortAction(true);
	    gs.addErrorMessage("Name already in use, choose another");
	}

})(current, previous);
