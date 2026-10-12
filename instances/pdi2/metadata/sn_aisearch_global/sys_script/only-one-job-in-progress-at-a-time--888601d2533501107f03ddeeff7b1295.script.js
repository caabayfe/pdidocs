(function executeRule(current, previous /*null when async*/ ) {

    var util = new AISMigrationUtils();

    if (util.getActiveOrchestrationRecord()) {
        gs.addErrorMessage(gs.getMessage('Another migration job already in progress'));
        current.setAbortAction(true);
    }


})(current, previous);
