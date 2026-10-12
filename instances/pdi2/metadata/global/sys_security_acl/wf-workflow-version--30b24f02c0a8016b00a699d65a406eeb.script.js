checkMe();

function checkMe() {
    var ac = new GlideRecord('wf_context');
    ac.addQuery('active', true);
    ac.addQuery('workflow_version', current.sys_id);
    ac.query();
    if (ac.next())
        return false; // it is running, don't delete it!

	// If this is checked out, and there is a published version, allow delete
	if ('true' != current.published +'') {
		var gr = new GlideRecord('wf_workflow_version');
		gr.addQuery('workflow', current.workflow);
		gr.addQuery('published', true);
		gr.query();
		if (gr.next())
			return true; // Can delete because there is a published version.
	}
	
    // Check to see if this is a subflow
    var isSubflow = new WorkflowValidateUtil().validateParentFlows(current).level;
    if (isSubflow == 1) 
        return false;
	
    return true;
}
