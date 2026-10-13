(function executeRule(current, previous /*null when async*/) {

    // Safely get the string value from the GlideElement
    var currentAccountName = current.getValue('name') || '';

    // Trim whitespace
    currentAccountName = currentAccountName.trim();

    // Check if name is empty after trimming
    if (gs.nil(currentAccountName)) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Name should not be empty."));
    }

})(current, previous);
