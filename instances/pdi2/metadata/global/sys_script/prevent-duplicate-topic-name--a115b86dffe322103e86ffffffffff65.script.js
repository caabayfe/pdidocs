(function executeRule(current, previous /*null when async*/) {
    if (new TaxonomyUtil().isDuplicateTopicName(current)) {
        gs.addErrorMessage(gs.getMessage('The name you entered is already in use in the selected taxonomy. Change the name or taxonomy and try again.'));  
	current.setAbortAction(true);
    }

})(current, previous);
