(function executeRule(current, previous /*null when async*/ ) {

    if (!current.user || (!gs.hasRole('sn_cmdb_admin') &&  (gs.getUserID() != current.user))) {
        current.setAbortAction(true);
    }

})(current, previous);
