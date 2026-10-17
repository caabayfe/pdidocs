(function executeRule(current, previous /*null when async*/) {
	
   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   gs.log("Update kb_feedback domain based on domain change of article versions: " + current.number);
   var gr = new GlideMultipleUpdate('kb_feedback');
   gr.addQuery('article.article_id', current.article_id);
   gr.addQuery('article.sys_id', '!=', current.sys_id);   //this scenario taken care in 'Domain - Cascade Domain - Knowledge' BR
   gr.setValue('sys_domain', current.sys_domain);
   gr.execute();
   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);

})(current, previous);
