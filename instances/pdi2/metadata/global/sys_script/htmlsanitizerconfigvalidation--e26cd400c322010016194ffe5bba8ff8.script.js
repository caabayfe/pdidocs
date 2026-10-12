(function executeRule(current, previous /*null when async*/ ) {
	if (current.operation() == "insert") {
		gr = new GlideRecord("sys_script_include");
		gr.addQuery("name", "HTMLSanitizerConfig");
		gr.query();
		var count = gr.getRowCount();
		if (count >= 1) {
			gs.addErrorMessage(gs.getMessage("Multiple HTMLSanitizerConfig script includes not supported"));
			current.setAbortAction(true);
			return;
		}
	}  
	
	if(current.client_callable == true) {
		gs.addErrorMessage(gs.getMessage("This Script-Include cannot be Client-Callable"));
		current.setAbortAction(true);
	} else if( (current.script != previous.script) || (current.active != previous.active) ) {
		var validate = SNC.GlideHTMLSanitizer.validateConfig(current.script);
		if(validate == false) {
			gs.addErrorMessage(gs.getMessage("Failed to create HTML Sanitization Policy"));
			current.setAbortAction(true);
		}
	}

})(current, previous);
