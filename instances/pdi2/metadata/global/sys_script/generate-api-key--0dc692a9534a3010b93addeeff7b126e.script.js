(function executeRule(current, previous) {
	  var secureRandom = GlideSecureRandomUtil;
    if (!gs.nil(current.getValue("authentication_key"))) {
        // this field should be left empty on insertion (enforced in UI by making it read only)
        gs.addErrorMessage(gs.getMessage("Authentication key field should be left empty on creation of a new API Key"));
        current.setAbortAction(true);
    }
    current.setDisplayValue("authentication_key", secureRandom.getSecureRandomString(32));
})(current, previous);
