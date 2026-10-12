(function executeRule(current, previous /*null when async*/) {

	var subscriptions = new GlideRecord('kb_social_qa_subscribe');
	subscriptions.addQuery('question',current.question);
	subscriptions.addQuery('profile',current.profile);
	subscriptions.query();
	if(subscriptions.next()){
		if(subscriptions.active){
			gs.addErrorMessage(gs.getMessage('User is already subscribed to the given question'));
			current.setAbortAction(true);
		}
		else
			subscriptions.deleteRecord();
	}

})(current, previous);
