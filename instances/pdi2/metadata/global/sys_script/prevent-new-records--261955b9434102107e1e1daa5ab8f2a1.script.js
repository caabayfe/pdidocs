(function executeRule(current, previous /*null when async*/) {
    gs.addErrorMessage(gs.getMessage("You cannot create empty hermes_app_services records."));
    current.setAbortAction(true);
})(current, previous);
