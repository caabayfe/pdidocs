(function executeRule(current, previous /*null when async*/ ) {
    var util = new LifeCycleUtil();
    if (util.isBulkPopulationActive() == true || new LifeCycleFieldsAlignmentJobUtil().isMigrationRunning() == true) {
        gs.addErrorMessage(gs.getMessage("Population of data from legacy status fields to CSDM life cycle fields is currently in progress, changes to mapping rules are temporarily blocked."));
        current.setAbortAction(true);
    }

})(current, previous);
