setTaskDefaultDomain();

function setTaskDefaultDomain() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   // Set the task's domain based on the "Task for" user's domain
   if (!current.task_for.nil()) {
      current.sys_domain = current.task_for.sys_domain;
      //Set the task's company if it does not have one
      if (current.company.nil())
         current.company = current.task_for.company;
   }
   
   // If the task is still global, put it in the Default domain
   if (current.sys_domain == 'global' || current.sys_domain.nil())
      current.sys_domain = getDefaultDomain();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
