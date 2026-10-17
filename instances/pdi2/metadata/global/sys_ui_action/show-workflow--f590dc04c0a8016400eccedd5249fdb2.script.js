// Show the workflow context in a new window
function showWorkflowContext() {
    var url = new GlideURL('/context_workflow.do');
    url.addParam('sysparm_stack', 'no');
    url.addParam('sysparm_table', 'sc_req_item');
	url.addParam('sysparm_document', g_form.getUniqueValue());
	g_navigation.open(url.getURL(), "_blank");
}
