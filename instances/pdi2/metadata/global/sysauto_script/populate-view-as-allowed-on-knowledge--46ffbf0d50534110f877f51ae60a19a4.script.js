populateViewAsAllowed();
	
	function populateViewAsAllowed() {
	    try {
	        var gr = new GlideMultipleUpdate("kb_knowledge");
	        var gc = gr.addNullQuery('view_as_allowed');
	        gc.addOrCondition('view_as_allowed', false);
	        gr.addQuery("sys_class_name", "!=", "kb_knowledge_block");
	        gr.query();
	        gr.setValue('view_as_allowed', true);
	        gr.execute();
	    } catch (e) {
	        gs.error("Failed to set default value of field - 'view as allowed' on knowledge" + e);
	    }
	}
