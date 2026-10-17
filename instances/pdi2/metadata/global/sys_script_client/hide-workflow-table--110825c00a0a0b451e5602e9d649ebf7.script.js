// We need the workflow version table on the form to use for table dependencies, but we don't want to show it
function onLoad() {
   g_form.setDisplay('workflow_version.table', false);  
}
