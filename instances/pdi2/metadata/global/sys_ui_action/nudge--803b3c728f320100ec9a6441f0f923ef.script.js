runWorkflow_forContext();

function runWorkflow_forContext() {
   var contextId = current.sys_id;
	
   if (contextId != null) {
       new Workflow().broadcastEvent(contextId, 'update');
   }
}
