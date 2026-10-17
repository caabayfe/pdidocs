if (!current.canDelete()) {
    gs.addErrorMessage(gs.getMessage("Current user does not have access to remove '{0}'", current.getDisplayValue()));
} else {
    new global.DocumentObjectManager().proceedWithRemoveFromList(current.getUniqueValue(), parent.getUniqueValue(), parent.getTableName());
}
