var comments = false;
if (current.comments.getJournalEntry(1) != undefined) {
	var lastComment = current.comments.getJournalEntry(1);
	var index = (current.comments.getJournalEntry(1) + '').indexOf(gs.getUserDisplayName());
	if (index > -1 && index <= 22)
		comments = true;
}
if (!global.JSUtil.nil(current.comments) || comments) {
	current.state = 'rejected';
	current.update();
	new global.ApprovalUserFeedback().rejected(current);
} else {
	gs.addErrorMessage(sn_i18n.Message.getMessage("sn_km_uib", "Comments are required when rejecting an approval"));
}
