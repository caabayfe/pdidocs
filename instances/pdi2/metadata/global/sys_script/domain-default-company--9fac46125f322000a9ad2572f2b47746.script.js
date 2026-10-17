// If a new company is global, put it in the Default domain.
// Do not run on update, by default - only insert.
setCompanyDefaultDomain();

function setCompanyDefaultDomain() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   current.sys_domain = getDefaultDomain();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
