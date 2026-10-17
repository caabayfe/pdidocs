(function() {
    var tables = NLUWorkbenchConstants.tables;
    var executionGr = new GlideRecord(tables.NLU_CONFLICT_EXECUTION);
    executionGr.addNullQuery('status');
    executionGr.setValue('status', 'success');
    executionGr.updateMultiple();
})();
