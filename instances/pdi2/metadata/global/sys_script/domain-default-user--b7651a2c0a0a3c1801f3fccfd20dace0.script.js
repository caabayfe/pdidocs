setUserDefaultDomain();

function setUserDefaultDomain() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   if (!current.company.nil())
      current.sys_domain = current.company.sys_domain;
   
   if (current.sys_domain == 'global' || current.sys_domain.nil())
      current.sys_domain = getDefaultDomain();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
