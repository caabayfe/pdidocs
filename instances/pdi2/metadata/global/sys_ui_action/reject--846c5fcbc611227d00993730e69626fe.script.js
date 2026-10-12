(function(){
current.state = 'rejected';
var comments = false;
if(current.comments.getJournalEntry(1) != undefined) {
	var lastComment = current.comments.getJournalEntry(1);
	var index = (current.comments.getJournalEntry(1)+'').indexOf(gs.getUserDisplayName());
	if (index > -1 && index <= 22)
		comments = true;
}
if(!JSUtil.nil(current.comments) || comments){
	current.update();
	new ApprovalUserFeedback().rejected(current);
}else{
	gs.addErrorMessage(gs.getMessage("Comments are required when rejecting an approval"));
	current.state = 'requested';
	current.setAbortAction(true);
}})();
