(function executeRule(current, previous /*null when async*/ ) {
    var incidentGr = current.document.getRefRecord();
    if (incidentGr.isValidRecord()) {
        gs.eventQueue('sn_sow_collab.sidebar.discussion.created', incidentGr, incidentGr.getValue('caller_id'), current.getValue('collab_chat'));
    }
})(current, previous);
