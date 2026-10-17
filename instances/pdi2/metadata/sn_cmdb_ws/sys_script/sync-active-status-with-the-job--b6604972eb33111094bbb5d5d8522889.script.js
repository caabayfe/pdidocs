(function executeRule(current, previous /*null when async*/ ) {

    var util = new sn_cmdb_ws.CMDBWsInsightUtil();

    // update the job to mark it either active true or false based on what the category active flag is set to
    util.updateQBJobActive(current.getValue(util.COLS.QUERY), current.getValue(util.COLS.ACTIVE));

    // update the status field as well to keep it in sync with the active field
    current.setWorkflow(false);
    current.setValue(util.COLS.STATUS, current.active ? util.QB_STATUS.READY : util.QB_STATUS.DISABLED);
    current.update();


})(current, previous);
