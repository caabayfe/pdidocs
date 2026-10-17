(function executeRule(current, previous /*null when async*/) {

   //make current transaction uncancelable while this rule runs,
   //set variable to previous cancelable state to restore when done
   var isCancelable = gs.setCannotCancel(true);
	
   gs.log("Update kb_version, kb_knowledge, kb_article_checklist_summary domain for all versions based on domain change of article: " + current.number);
   var gr = new GlideMultipleUpdate("kb_version");
   gr.addQuery('knowledge.article_id', current.article_id);	
   gr.setValue('sys_domain', current.sys_domain);
   gr.execute();
	
   var gr2 = new GlideMultipleUpdate("kb_article_checklist_summary");
   gr2.addQuery('article.article_id', current.article_id);	
   gr2.setValue('sys_domain', current.sys_domain);
   gr2.execute();
	
   var gr3 = new GlideRecord("kb_knowledge");
   gr3.addQuery('article_id', current.article_id);
   gr3.addQuery('sys_id', '!=', current.sys_id);
   gr3.setValue('sys_domain', current.sys_domain);
   gr3.setWorkflow(false);
   gr3.updateMultiple();
	
   //restore previous cancelable state
   gs.setCannotCancel(isCancelable);

})(current, previous);
