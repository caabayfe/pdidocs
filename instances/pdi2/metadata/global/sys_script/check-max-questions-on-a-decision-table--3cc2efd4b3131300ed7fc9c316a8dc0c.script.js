(function executeRule(current, previous /*null when async*/) {
	var previous_decision = previous.decision_table;
	var max_questions = parseInt(gs.getProperty('com.glide.decision_table.max_questions'));
	if(!gs.nil(max_questions)) {
		var num_current_questions = 0;
		var count_current_questions = new GlideAggregate('sys_decision_question');
		count_current_questions.addAggregate('COUNT');
		count_current_questions.addQuery('decision_table',current.decision_table);
		count_current_questions.query();
		if(count_current_questions.next()) {  
			num_current_questions = parseInt(count_current_questions.getAggregate('COUNT'));
			if (num_current_questions >= max_questions) {
			gs.addInfoMessage(gs.getMessage('Only {0} max questions can be associated with a decision table record',max_questions));
			current.setAbortAction(true);
			}
		}
	}
})(current, previous);
