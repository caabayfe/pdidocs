userDomainCascade();

function userDomainCascade() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
   	
   domainCascadeFromUser("sys_user_has_role");
   domainCascadeFromUser("sys_user_grmember");

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}

function domainCascadeFromUser(table) {
   gs.log("Update " + table + " domain based on domain change of user: " + current.user_name);
   var gr =  new GlideMultipleUpdate(table);
   gr.addQuery('user', current.sys_id);
   gr.setValue('sys_domain', current.sys_domain);
   gr.execute();
}
