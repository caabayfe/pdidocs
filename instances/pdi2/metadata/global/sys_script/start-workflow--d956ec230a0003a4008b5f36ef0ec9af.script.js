assignWorkflow();

function assignWorkflow() {
   if (!current.sla.workflow.nil())
      startWorkflow(current.sla.workflow.toString());
}

function startWorkflow(id) {
   // is this a retroactive start?
   var msecs = new GlideDateTime().getNumericValue() - current.start_time.getGlideObject().getNumericValue();
   
   // treat this as a retroactive workflow start if the SLA started more than 5 seconds ago
   var w = new Workflow();
   if (msecs <= 5000)
      w.startFlow(id, current, current.operation());
   else
      w.startFlowRetroactive(id, msecs, current, current.operation());

   // update the record in case the workflow changed some values
   current.update();
}
