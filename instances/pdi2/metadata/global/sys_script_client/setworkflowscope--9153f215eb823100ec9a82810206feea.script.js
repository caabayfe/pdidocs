function onLoad() {
	if(g_form.isNewRecord()) {
        var wfScope = g_scratchpad.workflowscope;
		if(wfScope)
	    	g_form.setValue('workflow.sys_scope', wfScope);
	}
}
