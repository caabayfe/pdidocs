(function executeRule(current, previous /*null when async*/ ) {
    var configRecord = current.content_type.getRefRecord();
    var categoryRefFeild = configRecord.getValue("category_reference_field");
	var contentRefFeild = configRecord.getValue("content_reference_field");
    var categoryDisplayValue = gs.getMessage("{0}", [current[categoryRefFeild].getDisplayValue()]);
	var contentDisplayValue = gs.getMessage("{0}", [current[contentRefFeild].getDisplayValue()]);
    current.setValue("category_display_value", categoryDisplayValue);
	current.setValue("content_display_value", contentDisplayValue);
})(current, previous);
