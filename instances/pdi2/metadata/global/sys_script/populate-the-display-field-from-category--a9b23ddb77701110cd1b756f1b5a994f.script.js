(function executeRule(current, previous /*null when async*/ ) {
    var configRecord = current.content_type.getRefRecord();
    var categoryRefFeild = configRecord.getValue("category_reference_field");
    var displayValue = gs.getMessage("{0}", [current[categoryRefFeild].getDisplayValue()]);
    current.setValue("category_display_value", displayValue);
})(current, previous);
