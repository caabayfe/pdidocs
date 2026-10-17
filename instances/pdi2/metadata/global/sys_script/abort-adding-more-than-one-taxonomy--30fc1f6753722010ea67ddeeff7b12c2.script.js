(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("m2m_sp_portal_taxonomy");
    gr.addQuery("sys_id", "!=", current.getUniqueValue());
    gr.addQuery("sp_portal", current.getValue("sp_portal"));
    gr.setLimit(1);
    gr.query();

    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Only one taxonomy can be associated to a portal"));
        current.setAbortAction(true);
    }
})(current, previous);
