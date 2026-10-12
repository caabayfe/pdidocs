domainCascadeFromEmail();

function domainCascadeFromEmail() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   gs.log("Update sys_attachment domain based on domain change of email: " + current.sys_id);
   var gr =  new GlideMultipleUpdate('sys_attachment');
   gr.addQuery('table_name', 'sys_email');
   gr.addQuery('table_sys_id', current.sys_id);
   gr.setValue('sys_domain', current.sys_domain);
   gr.execute();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
