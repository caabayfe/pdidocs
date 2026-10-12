(function executeRule(current, previous /*null when async*/ ) {
    const value = parseInt(current.value);

    // we cap it at 50 on the backend (RUNTIME_PERMISSION_LIMIT_UPPER_BOUND)
    if (value > 50) {
        gs.addErrorMessage(gs.getMessage("Value must be 50 or less."));
        current.setAbortAction(true);
    }

    if (value > 15) {
        gs.addWarningMessage(gs.getMessage("Setting this value over 15 may cause performance degradation during playbook runtime."));
    }
})(current, previous);
