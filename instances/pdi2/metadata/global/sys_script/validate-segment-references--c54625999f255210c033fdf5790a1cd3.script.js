(function executeRule(current, previous /*null when async*/ ) {
    var segmentGR = new GlideRecord("interaction_wrap_up_segment");
    segmentGR.addQuery("wrap_up_configuration", current.getValue("sys_id"));
    segmentGR.query();
    if (segmentGR.next()) {
        gs.addErrorMessage(gs.getMessage("This wrap up configuration is used in at least one wrap up segment. In order to maintain data integrity, it cannot be deleted while in use."));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
