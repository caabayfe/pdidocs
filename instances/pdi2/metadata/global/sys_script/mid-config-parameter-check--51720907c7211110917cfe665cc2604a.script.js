(function executeRule(current, previous /* null when async */ ) {
    var mcp = SncMIDConfigParameter;
    var param = mcp.byName(current.param_name);
    if (!param) {
        var nameMsg = gs.getMessage("MID Server config parameter name '{0}' is invalid", current.param_name);
        gs.addErrorMessage(nameMsg);
        current.setAbortAction(true);
        return;
    }

    try {
        param.parseAndValidateValue(current.value); // Ignore return value, throws exception if value is invalid
    } catch (e) {
        var valMsg = gs.getMessage("Invalid value: {0}", e.getMessage() != null ? e.getMessage() + '' : e + '');
        gs.addErrorMessage(valMsg);
        current.setAbortAction(true);
    }
}(current, previous));
