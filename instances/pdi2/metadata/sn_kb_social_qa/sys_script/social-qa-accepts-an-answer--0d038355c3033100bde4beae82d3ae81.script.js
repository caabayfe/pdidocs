function onBefore(current, previous) {
	var COMMUNITY = gs.getProperty('sn_communities.knowledge_base_id');
	
	if (!new SocialQACommon().showAccept(current) && current.question.kb_knowledge_base != COMMUNITY) {
		gs.addInfoMessage(gs.getMessage('Only poster or KB Manager can accept'));
		current.setAbortAction(true);
		return;
	}
	else {
		var question = new GlideRecord('kb_social_qa_question');
		question.get(current.question);
		if (current.accepted){
		// Set any previously accepted answer as unaccepted
			var gr = new GlideRecord('kb_social_qa_answer');
			gr.addQuery('question',current.question);
			gr.addActiveQuery();
			gr.addQuery('accepted','true');
			gr.accepted = false;
			gr.accepted_by = '';
			gr.updateMultiple();
			current.accepted_by = new global.GlobalKnowledgeUtil().getSessionProfile();
			question.accepted_answer = current.sys_id;
		}
		else {
			current.accepted_by = '';
			question.accepted_answer = '';
		}
		question.last_activity = new GlideDateTime();
		question.update();
	}
   
}
