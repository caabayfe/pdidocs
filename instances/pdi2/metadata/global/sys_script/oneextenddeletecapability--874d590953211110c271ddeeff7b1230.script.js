(function executeRule(current, previous /*null when async*/ ) {
    var defnGr = new GlideRecord("sys_one_extend_capability_definition");
    defnGr.addQuery("capability", current.sys_id);
    defnGr.query();

    if (defnGr.next()) {
        gs.addErrorMessage(gs.getMessage("There is one or more definition associated with this capability. Please delete all the related definitions before deleting this capability."));
        current.setAbortAction(true);
    }
})(current, previous);
