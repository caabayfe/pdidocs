(function executeRule(current, previous /*null when async*/) {

	var mappingGr = new GlideRecord('knowledge_based_question_answer_mapping');
	mappingGr.addQuery('question', current.question);
	mappingGr.addQuery('answer', current.answer);

	if(current.operation() == 'update') {
		mappingGr.addQuery('sys_id', '!=', current.sys_id);
	}

	mappingGr.query();
	if(mappingGr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Cannot save the record. Answer is already mapped to this Question. Please choose a different Answer or Question.'));
	}

})(current, previous);
