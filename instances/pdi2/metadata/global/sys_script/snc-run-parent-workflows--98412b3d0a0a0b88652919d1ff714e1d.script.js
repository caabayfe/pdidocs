// Run any workflow(s) so this task's state changes can be checked
runWorkflow_task();

function runWorkflow_task() {
   if (!current.parent.nil()) {
      var gr = new GlideRecord(current.parent.getTableName());
      gr.addQuery("sys_id",current.parent.toString());
      gr.query();
      if (gr.next()) {
      	new Workflow().broadcastEventToCurrentsContexts(gr, 'update', null);
      }
   }
}
