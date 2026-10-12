// Mark any other published workflows version for this workflow as unpublished
markWorkflowVersionsUnpublished();

function markWorkflowVersionsUnpublished() {
   var gr = new GlideRecord('wf_workflow_version');
   gr.addQuery('workflow', current.workflow);
   gr.addQuery('sys_id', '!=', current.sys_id);
   gr.addQuery('published', true);
   gr.query();
   while (gr.next()) {
      gs.print("Setting workflow version " + gr.name + ":" + gr.sys_id + " to unpublished");
      gr.published = false;
      gr.update();
   }
}
