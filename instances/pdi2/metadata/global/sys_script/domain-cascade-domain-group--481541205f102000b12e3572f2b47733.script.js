domainCascadeFromGroup();

function domainCascadeFromGroup() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   gs.log("Update sys_group_has_role domain based on domain change of group: " + current.name);
   var gr =  new GlideMultipleUpdate('sys_group_has_role');
   gr.addQuery('group', current.sys_id);
   gr.setValue('sys_domain', current.sys_domain);
   gr.execute();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
