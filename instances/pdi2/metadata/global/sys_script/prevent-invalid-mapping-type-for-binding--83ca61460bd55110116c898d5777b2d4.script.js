(function executeRule(current, previous /*null when async*/ ) {
    if (!current) return;

    var eventRuleUtil = new EventRuleUtil();

    var isRunAfterBindingEnabled = eventRuleUtil.isFieldMappingRunAfterBindingEnabled();
    if (!isRunAfterBindingEnabled)
        return;

    var runAfterBinding = current.getValue("run_after_binding");
    var mappingType = current.getValue("mapping_type");

    var isSupportedType = eventRuleUtil.isFieldMappingTypeSupportedWithRunAfterBinding(mappingType);
    if ((runAfterBinding == "1") && !isSupportedType) {
        current.setValue("run_after_binding", "0");

        // Abort action
        current.setAbortAction(true);

        // Show message
        gs.addErrorMessage(gs.getMessage('The combination of "Run after binding" and the selected mapping type "{0}" is unsupported.\nPlease change the value of either one of the fields.', [current.getDisplayValue('mapping_type')]));
    }

})(current, previous);
