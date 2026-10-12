(function executeRule(current, previous /*null when async*/ ) {

    var rhSysId = current.record_hierarchy;

    if (!rhSysId) {
        gs.warn('No record hierarchy specified');
        return;
    }

    var rhGR = new GlideRecord('sys_record_hierarchy');
    rhGR.addQuery('sys_id', rhSysId);
    rhGR.setLimit(1);
    rhGR.query();
    if (rhGR.next()) {
         if (SNC.CDCUnsupportedTable.isTableUnsupported(rhGR.table)) {
            var errorMsg = gs.getMessage("Unsupported table as source. Hierarchy is not supported on this table.");
            gs.addErrorMessage(errorMsg);
            current.setAbortAction(true);
            gs.setRedirectURL(current);
            return;
        }
    }

})(current, previous);
