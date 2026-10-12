(function executeRule(current, previous /*null when async*/ ) {

    if (current.getDisplayValue() != previous.getDisplayValue()) {
        var categoryDisplayValue = gs.getMessage("{0}", [current.getDisplayValue()]);

        var unconnectedCategoryContentGr = new GlideRecord("unconnected_category_content");
        unconnectedCategoryContentGr.addQuery("sc_category", current.sys_id.toString());
        unconnectedCategoryContentGr.setWorkflow(false);
        unconnectedCategoryContentGr.setValue("category_display_value", categoryDisplayValue);
        unconnectedCategoryContentGr.updateMultiple();

        var connectedCategoryGr = new GlideRecord("m2m_connected_category");
        connectedCategoryGr.addQuery("sc_category", current.sys_id.toString());
        connectedCategoryGr.setWorkflow(false);
        connectedCategoryGr.setValue("category_display_value", categoryDisplayValue);
        connectedCategoryGr.updateMultiple();
    }

})(current, previous);
