(function executeRule(current, previous /*null when async*/ ) {
    var table = new GlideRecord(current.source);
    var elem = table.getElement(current.field);
    if (!elem.getED().isVirtual()) {
        gs.addErrorMessage(gs.getMessage("Column '{0}' is not a calcualated field ", [current.field]));
        current.setAbortAction(true);
        gs.setRedirect(current.getLink(true));
    }

})(current, previous);
