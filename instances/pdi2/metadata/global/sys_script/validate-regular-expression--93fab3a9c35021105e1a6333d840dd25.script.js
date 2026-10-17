(function executeRule(current, previous /*null when async*/ ) {

    var regex = current.getValue('separator');
    try {
        new RegExp(regex);
    } catch (e) {
        gs.addErrorMessage(gs.getMessage('Invalid Regular Expression {0}', regex));
        current.setAbortAction(true);
    }

})(current, previous);
