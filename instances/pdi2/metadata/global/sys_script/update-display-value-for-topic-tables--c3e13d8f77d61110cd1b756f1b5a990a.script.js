(function executeRule(current, previous /*null when async*/ ) {

    function getRecordCount(encodedQuery) {
        var gr = new GlideAggregate("unconnected_category_content");
        gr.addEncodedQuery(encodedQuery);
        gr.addAggregate("COUNT");
        gr.query();
        gr.next();
        return gr.getAggregate("COUNT");
    }

    var displayValue = gs.getMessage("{0}", [current.getDisplayValue()]);
    var recordsWithKB = getRecordCount("knowledge=" + current.sys_id.toString());
    var recordsWithCorrectDisplay = getRecordCount("knowledge=" + current.sys_id.toString() + "^content_display_value=" + displayValue);

    if (recordsWithKB !== recordsWithCorrectDisplay) {
        var unconnectedCategoryContentGr = new GlideRecord("unconnected_category_content");
        unconnectedCategoryContentGr.addQuery("knowledge", current.sys_id.toString());
        unconnectedCategoryContentGr.setWorkflow(false);
        unconnectedCategoryContentGr.setValue("content_display_value", displayValue);
        unconnectedCategoryContentGr.updateMultiple();
    }

})(current, previous);
