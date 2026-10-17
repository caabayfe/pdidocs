domainCascadeFeedback();

function domainCascadeFeedback() {
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   gs.log("Update kb_feedback domain based on domain change of article: " + current.number);
   var gr =  new GlideMultipleUpdate('kb_feedback');
   gr.addQuery('article', current.sys_id);
   gr.setValue('sys_domain', current.sys_domain);
   gr.execute();

   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);
}
