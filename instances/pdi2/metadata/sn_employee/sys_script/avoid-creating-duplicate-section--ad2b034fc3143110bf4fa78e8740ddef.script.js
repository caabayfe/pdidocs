(function executeRule(current, previous /*null when async*/ ) {
    // Query the current section value and check if the entry is already configured
    var mtomGr = new GlideRecord(current.getTableName());
    mtomGr.addQuery("sn_employee_overview_section", current.getValue("sn_employee_overview_section"));
    mtomGr.addQuery("sn_employee_tab_widget_mapping", current.getValue("sn_employee_tab_widget_mapping"));
    mtomGr.query();
    if (mtomGr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Section '{0}' is already configured for Tab Widget Mapping, same section is not allowed to be configured twice.", current.getDisplayValue("sn_employee_overview_section")));
        current.setAbortAction(true);
    }
})(current, previous);
