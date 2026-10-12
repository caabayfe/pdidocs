// Task Template reference qualifier for the workflow task activities
function workflowTaskTemplateReferenceQualifier() {
   // qualify the template to only include the task table and any tables that it extends
   var arr = GlideDBObjectManager.getTables(current.vars.task_table.toString());
   var tables = GlideStringUtil.join(arr);
   return 'tableIN' + tables;
}
