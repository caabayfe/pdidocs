validateDelete();

function validateDelete() {
	//Get all the instances that are based on this metric type
	var canDelete = (new AssessmentUtils()).canDeleteMetric(current);
	if (canDelete == false) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("This question can't be deleted as user(s) have already answered it. You may mark it as inactive or edit it."));
	}
}
