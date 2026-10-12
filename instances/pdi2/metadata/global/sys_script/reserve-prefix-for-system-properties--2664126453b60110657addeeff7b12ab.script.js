(function executeRule(current, previous /*null when async*/ ) {
    var abortAction = false;
    if (!gs.hasRole('maint')) {
        if (current.operation() == 'update') {
            if (previous.name.startsWith("sys_")) {
                if (current.name != previous.name)
                    abortAction = true;
            } else if (current.name.startsWith("sys_")) {
                abortAction = true;
            }
        } else if (current.operation() == 'delete' && current.name.startsWith("sys_")) {
            abortAction = true;
        }
    }

    if (abortAction) {
        gs.addErrorMessage(gs.getMessage("Prefix sys_ is reserved for system properties."));
        current.setAbortAction(abortAction);
    }
})(current, previous);
