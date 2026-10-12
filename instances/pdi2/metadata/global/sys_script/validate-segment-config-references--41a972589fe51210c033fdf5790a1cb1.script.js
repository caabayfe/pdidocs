(function executeRule(current, previous /*null when async*/ ) {
    var isOperationUpdate = current.operation().equals("update");
    var isOperationDelete = current.operation().equals("delete");
    var isOperationInsert = current.operation().equals("insert");

    var isCodeEqual = current.getValue("code").equals(previous.getValue("code"));
    var isActiveEqual = current.getValue("active").equals(previous.getValue("active"));

    if (isOperationUpdate && isCodeEqual && isActiveEqual)
        return;

    if (isOperationUpdate || isOperationDelete) {
        var isWrapUpCodeExistsInSegment = new global.WrapUpCodeValidations().isWrapUpCodeReferencedInSegment(current.getValue("sys_id"));
        if (isWrapUpCodeExistsInSegment) {
            gs.flushMessages();
            gs.addErrorMessage(gs.getMessage("This code is used in at least one wrap up segment. In order to maintain data integrity, it cannot be deleted or updated (except for description)."));
            current.setAbortAction(true);
            return;
        }

        var isConfigurationExists = new global.WrapUpCodeValidations().isWrapUpCodeReferencedInConfiguration(current.getValue("sys_id"));
        if (isConfigurationExists) {
            gs.flushMessages();
            gs.addErrorMessage(gs.getMessage("This code is used in at least one wrap up configuration. It cannot be deleted or updated (except for description) while in use."));
            current.setAbortAction(true);
            return;
        }
    }

    if (isOperationUpdate || isOperationInsert) {
        var isCodeExistsInWrapUpCode = new global.WrapUpCodeValidations().doesCodeValueExist(current.getValue("sys_id"), current.getValue("code"));
        if (isCodeExistsInWrapUpCode) {
            gs.flushMessages();
            gs.addErrorMessage(gs.getMessage("Code {0} already exists, please use different code.", current.getValue("code")));
            current.setAbortAction(true);
            return;
        }
    }

})(current, previous);
