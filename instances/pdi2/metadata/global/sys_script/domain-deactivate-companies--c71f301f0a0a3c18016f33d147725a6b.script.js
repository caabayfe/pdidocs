deactivateCompanies();

function deactivateCompanies() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   var gr = new GlideRecord('core_company');
   gr.addQuery('sys_domain', current.sys_id);
   gr.addActiveQuery();
   gr.query();
   while (gr.next()) {
      gr.active = false;
      gr.update();
      gs.log("Company: " + gr.name + " deactivated due to deactivation of Domain: " + current.name);
   }

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
