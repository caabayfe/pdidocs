(function executeRule(current, previous /*null when async*/ ) {
	// Legacy viz_sharer role
	if (!new global.VizDesignerUtil().canShareViz(current.component))
		return;
	
    var answer = false;
    var errorMessage = "Something went wrong, please check with your system administrator.";
	
    if (gs.hasRole('viz_admin') || current.getValue('owner') == '1') {
        answer = true;
    } else {
        var gr = new GlideRecord('par_visualization');
        if (gr.isValid()) {
            gr.setWorkflow(false);
            if (gr.get(current.getValue('component'))) {
                if (!gr.canRead()) {
                    answer = false;
                    errorMessage = "You do not have access to this visualization.";
                } else if (current.getValue("write") == '1') {
                   answer = gr.canWrite();
                    errorMessage = "You only have viewing rights to this visualization. You cannot share it with editing rights.";
                } else
                    answer = true;
            }
        }
    }

    if (!answer) {
        gs.addErrorMessage(gs.getMessage(errorMessage));
        current.setAbortAction(true);
    }

})(current, previous);
