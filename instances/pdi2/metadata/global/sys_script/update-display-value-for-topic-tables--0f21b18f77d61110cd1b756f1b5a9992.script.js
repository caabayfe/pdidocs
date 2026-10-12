(function executeRule(current, previous /*null when async*/ ) {
    var currentDisplayValue = current.getDisplayValue();
    if (currentDisplayValue != previous.getDisplayValue()) {
        var unconnectedCategoryContentGr = new GlideRecord("unconnected_category_content");
        unconnectedCategoryContentGr.addQuery("catalog_item", current.sys_id.toString());
        unconnectedCategoryContentGr.setWorkflow(false);
        unconnectedCategoryContentGr.setValue("content_display_value", gs.getMessage("{0}", [currentDisplayValue]));
        unconnectedCategoryContentGr.updateMultiple();
    }

})(current, previous);
