(function executeRule(current, previous) {
    // A decision is final (FR-07): only a pending item can be decided.
    if (previous.getValue('decision') != 'pending') {
        gs.addErrorMessage(gs.getMessage('This item was already decided.'));
        current.setAbortAction(true);
        return;
    }
    var decision = current.getValue('decision');
    if (decision == 'keep' || decision == 'revoke') {
        current.setValue('decided_by', gs.getUserID());
        current.setValue('decided_on', new GlideDateTime());
    }
    current.setValue('state', decision == 'keep' || decision == 'revoke' ? '3' : '7');
})(current, previous);
