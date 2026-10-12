(function executeRule(current, previous /*null when async*/ ) {
    var configRecord = current.content_type.getRefRecord();
    var contentRefFeild = configRecord.getValue("content_reference_field");
    var displayValue = gs.getMessage("{0}: {1}", [configRecord.getDisplayValue(), current[contentRefFeild].getDisplayValue()]);
    if ( contentRefFeild === "knowledge" && new KBCommon().isVersioningEnabled() && (current.knowledge.workflow_state == 'published' && isMinorVersion(current.knowledge.version.version))) {
      var nextMajorVersion = (new KBVersioning())._nextMajorVersion(current.knowledge.version.version + '');
      var knowledgeNumber = current.knowledge.number + '';
      displayValue = gs.getMessage("Knowledge: {0} v{1}", [knowledgeNumber, nextMajorVersion]);
    }
    current.setValue("content_display_value", displayValue);
})(current, previous);

function isMinorVersion(version){
	var digits = version.split('.');
	if(digits.length > 0 && digits[1]!=0)
		return true;
	else
		return false;
	
}
