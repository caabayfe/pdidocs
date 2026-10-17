(function executeRule(current, previous /*null when async*/ ) {
    if (gs.isInteractive()) {
        var approvalState  = current.getDisplayValue('state');
        gs.addInfoMessage(sn_i18n.Message.getMessage("global", "Approval was successfully: {state}", {state: approvalState}));
    }
})(current, previous);
