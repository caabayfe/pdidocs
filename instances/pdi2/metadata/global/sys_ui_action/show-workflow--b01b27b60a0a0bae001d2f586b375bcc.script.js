// Show the workflow context in a new window
function showWorkflowContext() {
    var id = g_form.getUniqueValue();
    var url = new GlideURL('/context_workflow.do');
    url.addParam('sysparm_stack', 'no');
    url.addParam('sysparm_sys_id', id);
    url.addParam('sysparm_show_all', 'true');
	g_navigation.open(url.getURL(), "_blank");
}
