var isValid = SncIPAuthenticator.validateSelf(current);
if (!isValid) {
    var operation = current.getOperation();
    gs.addInfoMessage(gs.getMessage("Altering that range would lock your current IP address out!"));
    current.setAbortAction(true);
}
