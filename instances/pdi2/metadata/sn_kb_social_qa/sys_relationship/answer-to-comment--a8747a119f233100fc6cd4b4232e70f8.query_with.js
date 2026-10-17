(function refineQuery(current, parent) {

	// Add your code here, such as current.addQuery(field, value);
	current.addQuery('reference_id',parent.sys_id);
	current.addQuery('reference_name', 'kb_social_qa_answer');
	current.addActiveQuery();

})(current, parent);
