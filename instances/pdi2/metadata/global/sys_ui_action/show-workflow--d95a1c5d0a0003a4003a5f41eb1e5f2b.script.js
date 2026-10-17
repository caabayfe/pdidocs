// Show the workflow context in a new window
function showWorkflowContext() {
   var id = $F('sys_uniqueValue');
   var url = 'context_workflow.do?sysparm_stack=no&sysparm_table=task_sla&sysparm_document=' + id;
   g_navigation.open(url, '_blank');
}
