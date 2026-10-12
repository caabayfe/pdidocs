(function executeRule(current, previous /*null when async*/ ) {
    if (current.context.type != "CONTEXT" || (!gs.nil(current.finding_def) && current.context.finding_def != current.finding_def)) {
        gs.addErrorMessage(gs.getMessage("The contextual condition should belong to the same finding definition having the same table as the condition, and of type 'Contextual field/value condition'."));
        current.setAbortAction(true);
        action.setRedirectURL(current);
    }

})(current, previous);
