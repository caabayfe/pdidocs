(function executeRule(current, previous /*null when async*/ ) {
    //merge Form Action Layout Items, Global UI Actions, and Global DAs into a single consolidated list.
    var tableName = current.table;
    var layoutSysId = current.sys_id;
    var isNewLayout = true;
    try {
        (new UXFormActionUtil()).unifyActions(tableName, layoutSysId, isNewLayout);
        current.use_layout_items_only = true;
    } catch (ex) {
        gs.addErrorMessage(gs.getMessage("Unexpected error occurred while unifying Actions: {0}", ex.message));
    }
})(current, previous);
