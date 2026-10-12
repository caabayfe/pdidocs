(function executeRule(current, previous /*null when async*/ ) {

    var missingRequiredFieldNameLabelMap = SyncTypeUtil.checkRequiredFields(current.table_name, current.id_fields);
    var unsupportedFieldNameLabelMap = SyncTypeUtil.checkUnsupportedFields(current.table_name, current.id_fields);

    if (Object.keys(missingRequiredFieldNameLabelMap).length > 0) {
        var missingRequiredFieldsErrorMsg = gs.getMessage('{0} is required for federated id generation', SyncTypeUtil.getCommaSeparatedValues(missingRequiredFieldNameLabelMap));
        gs.addErrorMessage(missingRequiredFieldsErrorMsg);
    }

    if (Object.keys(unsupportedFieldNameLabelMap).length > 0) {
        var unsupportedFieldsErrorMsg = gs.getMessage('{0} cannot be added for federated id', SyncTypeUtil.getCommaSeparatedValues(unsupportedFieldNameLabelMap));
        gs.addErrorMessage(unsupportedFieldsErrorMsg);
    }

    if (Object.keys(missingRequiredFieldNameLabelMap).length > 0 || Object.keys(unsupportedFieldNameLabelMap).length > 0) {
        current.setAbortAction(true);
    }

})(current, previous);
