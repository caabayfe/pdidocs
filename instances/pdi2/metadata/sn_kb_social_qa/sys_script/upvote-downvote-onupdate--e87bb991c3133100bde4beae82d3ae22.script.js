function onBefore(current, previous) {
	var currentUser = new global.GlobalKnowledgeUtil().getSessionProfile();
	var gr = new GlideRecord(current.reference_name);
	gr.get(current.reference_id);

	if(gr.profile == currentUser && !isKBManager(current, currentUser)) {
		gs.addErrorMessage(gs.getMessage('Self voting is not allowed'));
	    current.setAbortAction(true);
		return;
	}

	if(hasUserVoted(currentUser,current)){
	   updateVoteCount(gr,current,previous);
	}	

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


function hasUserVoted(currentUser,current){
	var grVote = new GlideRecord('kb_social_qa_vote');
	grVote.addActiveQuery();
	grVote.addQuery('profile', currentUser);
	grVote.addQuery('reference_id', current.reference_id);
	grVote.addQuery('reference_name', current.reference_name);
	grVote.query();
	
	return grVote.hasNext();
}

function updateVoteCount(gr,current,previous){	
	var VOTE_CHANGE = 1;
	if(isDownvoteToUpvote(current,previous)){
		gr.votes = parseInt(gr.votes, 10) + VOTE_CHANGE;
	    gr.update();
	}else if(isUpvoteToDownvote(current,previous)){
		gr.votes = parseInt(gr.votes, 10) - VOTE_CHANGE;
	    gr.update();
	}	
}

function isDownvoteToUpvote(current,previous){
	return !previous.up_vote && current.up_vote;
}

function isUpvoteToDownvote(current,previous){
	return  previous.up_vote && !current.up_vote;
}
