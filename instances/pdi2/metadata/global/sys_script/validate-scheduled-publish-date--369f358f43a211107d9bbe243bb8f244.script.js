(function executeRule(current, previous /*null when async*/ ) {

    if (new KBCommon().validateScheduledPublishDate(current)) {
        gs.addErrorMessage(gs.getMessage("The Scheduled Publish Date must be set at least 24 hr after the current date."));
        current.setAbortAction(true);
    }

})(current, previous);
