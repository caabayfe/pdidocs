pauseWorkflow();

function pauseWorkflow() {
   var wf = new Workflow().getRunningFlows(current);
   while(wf.next()) {     
      new Workflow().broadcastEvent(wf.sys_id, 'pause');
   }
}
