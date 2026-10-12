(function executeRule(current, previous /*null when async*/ ) {
    if (!gs.nil(current.name)) {
        var trimmedName = current.name.trim();
        if (trimmedName != current.name) {
            gs.addErrorMessage(gs.getMessage("Name can't contain leading and trailing white spaces"));
            current.setAbortAction(true);
        }
        if (current.name.contains("/")) {
            gs.addErrorMessage(gs.getMessage("Name can't contain a slash (/)."));
            current.setAbortAction(true);
        }
    }
})(current, previous);
