setCompanyActiveFlag();

function setCompanyActiveFlag() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   var dom = new GlideRecord('domain');
   if (!dom.get(current.sys_domain))
      return; //no such domain

   if (current.active && current.operation() != "delete")
      dom.active = true; //make sure domain is active
   else {
      var gr = new GlideRecord('core_company');
      gr.addQuery('sys_domain', current.sys_domain);
      gr.addActiveQuery();
      gr.setLimit(1);
      gr.query();
      dom.active = gr.hasNext(); //make domain active if it has more than one active company
   }
   dom.update();
	
   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
