(function executeRule(current, previous /*null when async*/ ) {
    var inputTable = current.getValue('input_table');
    var parentTables = new GlideTableHierarchy(inputTable).getTables();
    var referenceTable = current.getValue('reference_table');
    var referenceTableGr = new GlideRecord(referenceTable);
    var inputField = current.getValue('input_field');
    var inputFieldReferenceTable = referenceTableGr.getElement(inputField).getReferenceTable();
    if (parentTables.indexOf(inputFieldReferenceTable) == -1) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Select an input field that's a reference field of the input table."));
    }
})(current, previous);
