(function executeRule(current, previous /*null when async*/ ) {

    var isDefault = (current.getValue('default')=='1');
    var uxApplicationId = current.getValue('ux_application');

    if (isDefault && !gs.nil(uxApplicationId)) {
        gs.addErrorMessage(gs.getMessage("The default configuration cannot be associated with a UX Application"));
        current.setAbortAction(true);
    } else if (!isDefault && gs.nil(uxApplicationId)) {
        gs.addErrorMessage(gs.getMessage("Non-default configurations must be associated with a UX Application"));
        current.setAbortAction(true);
    }

})(current, previous);
