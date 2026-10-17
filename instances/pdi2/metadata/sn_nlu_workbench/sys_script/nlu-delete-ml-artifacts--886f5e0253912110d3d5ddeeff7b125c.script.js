(function executeRule(current, previous /*null when async*/ ) {

    var modelName = current.name;
    var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;

    var ml_capability_def_gr = new GlideRecord(tables.ML_CAPABILITY_DEFINITION_BASE);
    ml_capability_def_gr.addQuery('solution_name', modelName);
    ml_capability_def_gr.query();
    if (ml_capability_def_gr.next())
        ml_capability_def_gr.deleteRecord();

})(current, previous);
