(function executeRule(current, previous /*null when async*/ ) {
	try {
		new sn_oe_sfs.CollabChatUtils().sendEmailToRequesterWhenAddedToDiscussion(current);
	} catch(ex) {
		gs.error("Exception in constructing email for the report " + ex.stack, ex);
	}

})(current, previous);
