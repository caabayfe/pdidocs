resumeWorkflow();

function resumeWorkflow() {
   var wf = new Workflow().getRunningFlows(current);
   while(wf.next()) {     
      new Workflow().broadcastEvent(wf.sys_id, 'resume');
   }
}
