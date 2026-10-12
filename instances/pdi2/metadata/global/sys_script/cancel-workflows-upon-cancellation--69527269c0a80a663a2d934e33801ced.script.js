/**
Service-now.com

Description: If task state changes to closed incomplete (4), cancel related workflows so we don't keep tasks active
 **/

cancelMyWorkflows();

function cancelMyWorkflows() {
   //get workflow helper
   var workflow = new Workflow();
   //cancel all my workflows
   var numCnxd = workflow.cancel(current);
   if (numCnxd > 1)
      gs.addInfoMessage(gs.getMessage("{0} Workflows for {1} have been cancelled", numCnxd, current.getDisplayValue()));
   else if (numCnxd == 1)
      gs.addInfoMessage(gs.getMessage("1 Workflow for {0} has been cancelled", current.getDisplayValue()));
}
