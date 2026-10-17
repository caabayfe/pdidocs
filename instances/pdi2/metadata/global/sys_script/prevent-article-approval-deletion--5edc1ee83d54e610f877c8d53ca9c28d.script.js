(function executeRule(current, previous /*null when async*/ ) {
    gs.addInfoMessage(gs.getMessage("You can't delete this approval record. Try approving or rejecting instead."));
    current.setAbortAction(true);

})(current, previous);
