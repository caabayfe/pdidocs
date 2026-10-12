validateTarget();

function validateTarget() {
   
   if( current.type != 'client_callable_script_include' )
   	return;

   //We are fine with creating a '*' ACL
   if (current.name == '*')
	   return;
   
   var gr = new GlideRecord("sys_script_include");
   gr.addQuery("name", "=", current.name);
   gr.query();
   
   if (!gr.next()) {
	  gs.addErrorMessage(gs.getMessage('Script Include named "{0}" does not exist', current.name));
      current.setAbortAction(true);
      return;
   } else if (gr.client_callable != 1 && gr.mobile_callable != 1) {
	  gs.addErrorMessage(gs.getMessage('"{0}" is not a Client Callable or Mobile Callable Script Include', current.name));
      current.setAbortAction(true);
      return;
   }
   
}
