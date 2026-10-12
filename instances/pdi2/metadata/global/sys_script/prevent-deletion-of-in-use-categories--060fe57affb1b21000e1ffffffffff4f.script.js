(function executeRule(current, previous /*null when async*/ ) {

    if (!new STTRMCategory(current).canDelete()) {
        gs.addErrorMessage(gs.getMessage('The category is currently in use, and cannot be deleted'));
        current.setAbortAction(true);
    }

})(current, previous);
