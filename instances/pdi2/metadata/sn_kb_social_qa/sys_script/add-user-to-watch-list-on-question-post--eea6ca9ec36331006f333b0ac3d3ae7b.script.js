function onAfter(current, previous) {
   //This function will be automatically called when this rule is processed.
    var grWatch = new GlideRecord('kb_social_qa_subscribe');
	grWatch.initialize();
	grWatch.setValue('question', current.getUniqueValue());
	grWatch.insert();
}
