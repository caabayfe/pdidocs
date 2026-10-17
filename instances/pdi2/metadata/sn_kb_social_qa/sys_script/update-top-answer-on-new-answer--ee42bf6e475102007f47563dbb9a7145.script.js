(function executeRule(current, previous /*undefined when async or display*/) {
	
	var community_kb = gs.getProperty('sn_communities.knowledge_base_id');
	if(current.question.kb_knowledge_base != community_kb){
		var question = new GlideRecord('kb_social_qa_question');
		if(question.get(current.question)) {
			var gr = new GlideRecord('kb_social_qa_answer');
			gr.addActiveQuery();
			gr.addQuery('question', current.question);
			gr.addQuery('votes', '>', -1);
			gr.addQuery('accepted', false); //Accepted Answer is already indexed, so only indexing top possitive answer
			gr.orderByDesc('votes');
			gr.orderByDesc('sys_created_on');
			gr.query();
			if(gr.next()) {
				if(question.top_answer != gr.sys_id) {
					question.top_answer = gr.sys_id;
					question.update();
				}
			}
			else {
				question.top_answer = '';
				question.update();
			}
		}
	}
})(current, typeof previous != 'undefined' ?  previous : null);
