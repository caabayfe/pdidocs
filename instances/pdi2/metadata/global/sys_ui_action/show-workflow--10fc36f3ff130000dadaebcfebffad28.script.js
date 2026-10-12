// Show the workflow version in a new window
function showWorkflowVersion() {
   var url = new GlideURL('workflow_ide.do');
   url.addParam('sysparm_sys_id', g_form.getUniqueValue());
   g_navigation.open(url.getURL(), "_blank")
}
