(function executeRule(current, previous /*null when async*/ ) {
    var grCapabilityDef = current.ml_solution_id.ml_capability_definition.getRefRecord();
    if (grCapabilityDef.isValidRecord()) {
        grCapabilityDef.deleteRecord();
    }
})(current, previous);
