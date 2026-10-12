runWorkflow_forContext();

function runWorkflow_forContext() {
   var contextId = current.sys_id;
	
   if (contextId != null) {
       sn_fd.FlowAPI.nudgeFlow(contextId, 1);
   }
}
