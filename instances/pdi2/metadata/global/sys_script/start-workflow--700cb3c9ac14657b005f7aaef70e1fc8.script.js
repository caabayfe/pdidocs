startWorkflow(current.cat_item.workflow.toString());

function startWorkflow(id) {
   var w = new Workflow();
   var context = w.startFlow(id, current, current.operation(), getVars());
   if (context != null) 
   	current.context = context.sys_id;
}

/**
 * Get the variables from the request item so that we can map these to the workflow.input 
 * variables if the names match.
 */
function getVars() {
   var vars = {};
   for (var n in current.variables) 
      vars[n] = current.variables[n];
   
   return vars;
}
