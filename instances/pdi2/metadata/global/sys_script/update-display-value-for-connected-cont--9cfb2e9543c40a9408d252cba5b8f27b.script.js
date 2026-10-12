(function executeRule(current, previous /*null when async*/ ) {
    var currentDisplayValue = current.getDisplayValue();
    var connectedContentGr = new GlideRecord("m2m_connected_content");
    connectedContentGr.addQuery("catalog_item", current.getUniqueValue());
    connectedContentGr.query();
    while (connectedContentGr.next()) {
        var configRecord = connectedContentGr.content_type.getRefRecord();
        var displayValue = gs.getMessage("{0}: {1}", [configRecord.getDisplayValue(), currentDisplayValue]);
        connectedContentGr.setValue("content_display_value", displayValue);
        connectedContentGr.update();
    }
})(current, previous);
