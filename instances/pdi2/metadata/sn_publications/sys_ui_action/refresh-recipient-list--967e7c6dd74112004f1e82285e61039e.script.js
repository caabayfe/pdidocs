(function() {
	if(current.state == 1){
		gs.addErrorMessage(gs.getMessage("You are currently refreshing the list"));
		action.setRedirectURL(current);
		return;
	}

	var totalCount = new RecipientsListApi().getRecipientsListCount(current.recipient_lists);
	var minCount = 2000;
	var maxCount = gs.getProperty('sn_publications.max_email');

	if((totalCount>maxCount)&&!current.skip_notifications){
		gs.addErrorMessage(gs.getMessage("Recipient list exceeds maximum email recipient limit: {0}", maxCount));
		action.setRedirectURL(current);
		return;
	}else if(totalCount>minCount){
		current.state = 1;
		current.percentage = 0;
		current.update();
		gs.eventQueue("sn_publications.build_rl_publication",current,totalCount);
		action.setRedirectURL(current);
	}else{
		current.state = 1;
		current.percentage = 0;
		current.update();
		new RecipientsListApi().buildRecipientsListForPublication(current.getUniqueValue());
		action.setRedirectURL(current);
	}
})();
