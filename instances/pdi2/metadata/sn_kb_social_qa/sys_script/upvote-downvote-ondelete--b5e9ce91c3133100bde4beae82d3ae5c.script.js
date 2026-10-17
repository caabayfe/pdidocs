function onBefore(current, previous) {
	var currentUser = new global.GlobalKnowledgeUtil().getSessionProfile();

	var gr = new GlideRecord(current.reference_name);
	gr.get(current.reference_id);
	
	if(gr.profile == currentUser) {
		if(!isKBManager(current, currentUser)) {
			gs.addErrorMessage(gs.getMessage('Self voting is not allowed'));
			current.setAbortAction(true);
			return false;
		}
	}
	
    updateVoteCount(gr,current,previous);	
}


function isKBManager(voteGR, profile) {
	if(gs.hasRole('admin'))
		return true;
	
	var sessionProfile = new global.GlobalKnowledgeUtil().getProfileDetails(profile);
	var gr = new GlideRecord(voteGR.getValue('reference_name'));
	if(gr.get(voteGR.getValue('reference_id'))) {
		var kb = '';
		if(voteGR.getValue('reference_name') == 'kb_social_qa_question')
			kb = gr.getValue('kb_knowledge_base');
		else
			kb = gr.question.kb_knowledge_base;
		
		var kb_manager = new SocialQACommon().isKnowledgeManager(kb, sessionProfile.user);
		if(kb_manager)
			return true;
	}
	return false;
}

function updateVoteCount(gr,current,previous){
	var VOTE_CHANGE = 1;
	if(isDownVoteToNoVote(current,previous)){
		gr.votes = parseInt(gr.votes, 10) + VOTE_CHANGE;
	    gr.update();
	}else if(isUpVoteToNoVote(current,previous)){
		gr.votes = parseInt(gr.votes, 10) - VOTE_CHANGE;
	    gr.update();
	}	
}

function isDownVoteToNoVote(current,previous){
	return !previous.up_vote;
}

function isUpVoteToNoVote(current,previous){
	return  previous.up_vote;
}
