(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (current.source_user == current.target_user) {
        gs.addErrorMessage(gs.getMessage("Member and Target member should not be same."));
        current.setAbortAction(true);
    }

})(current, previous);
