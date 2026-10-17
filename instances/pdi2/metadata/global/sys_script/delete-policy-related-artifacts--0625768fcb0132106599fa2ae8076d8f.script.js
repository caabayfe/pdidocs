(function executeRule(current, previous /*null when async*/ ) {
    var decisionTableId = current.decision_table;
    var policySysId = current.sys_id;
    var input_table_name = 'var__m_sys_decision_input_' + decisionTableId;
    gs.warn('AdaptiveAuth: clearing out the records for policySysId: ' + policySysId + ', decisionTableId: ' + decisionTableId);

    try {
        //delete sys_metadata_link records associated with referenced decisionTableId
        clearRecordsFromTable(policySysId, 'sys_metadata_link', 'tablename=sys_auth_policy_condition^payloadLIKE' + input_table_name);
        //delete sys_choice records based on the associated decisionTableId
        clearRecordsFromTable(policySysId, 'sys_choice', 'name=' + input_table_name);

        var dt = new sn_dt.DecisionTableAPI();
        var response = dt.deleteDecisionTable(decisionTableId);
        gs.info('AdaptiveAuth: Decision Table records associated with the policySysId: ' + policySysId + ' deleted with status - ' + response.status);

    } catch (exception) {
        gs.error('AdaptiveAuth: Exception occurred while clearing out the records for policySysId: ' + policySysId + ', Exception details: ' + exception);
    }

})(current, previous);

//clear the records from the given table..
function clearRecordsFromTable(policySysId, tableName, encodedQuery) {
    var tableGr = new GlideRecord(tableName);
    if (tableGr.isValid()) {
        tableGr.addEncodedQuery(encodedQuery);
        tableGr.query();
        if (tableGr.getRowCount() > 0)
            tableGr.deleteMultiple();
    } else {
        gs.error('AdaptiveAuth: ' + tableName + ' table does not exist.');
    }
}
