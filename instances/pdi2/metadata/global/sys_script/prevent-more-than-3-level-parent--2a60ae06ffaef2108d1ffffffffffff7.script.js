(function executeRule(current, previous /*null when async*/ ) {

    if (new STTRMCategory(current).getDepth() > 3) {
        gs.addErrorMessage(gs.getMessage('The parent hierarchy should not exceed 3 levels.'));
        current.setAbortAction(true);
    }

})(current, previous);
