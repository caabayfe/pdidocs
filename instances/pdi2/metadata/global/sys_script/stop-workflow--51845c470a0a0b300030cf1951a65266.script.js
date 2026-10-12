stopWorkflow();

function stopWorkflow() {
   var w = new Workflow();
   w.cancel(current);
}
