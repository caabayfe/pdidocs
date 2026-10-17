function onBefore(current, previous) {
    //This function will be automatically called when this rule is processed.
    //Cascade delete all comments associated with this answer
	var gr = new GlideRecord('kb_social_qa_comment');
	gr.addQuery('reference_name', 'kb_social_qa_answer');
	gr.addQuery('reference_id', current.sys_id);
	gr.query();
	gr.deleteMultiple();
}
