(function executeRule(current, previous /*null when async*/ ) {
    if (current.target_scope == 'global' && !(gs.hasRole('maint') || gs.getUser().getName() == 'system')) {
        gs.addErrorMessage(gs.getMessage("Only maint can create or update an RCA record targeting global scope"));
        current.setAbortAction(true);

        return false;
    }

    if (current.target_scope == 'global' && (current.source_type == 5 || current.target_type == 3 || current.target_type == 4 || current.target_type == 5)) {
        gs.addErrorMessage(gs.getMessage("When targeting global, only source-to-target records are supported and the target must be either a table or script include"));
        current.setAbortAction(true);

        return false;
    }

    return true;
})(current, previous);
