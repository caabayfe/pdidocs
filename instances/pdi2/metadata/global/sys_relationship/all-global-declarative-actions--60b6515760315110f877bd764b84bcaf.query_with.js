(function refineQuery(current, parent) {
    //This refines all Declarative Actions for this table Hierarchy 
    //but removes if its associated with a layoutitem
    var uxFormActionUtil = new UXFormActionUtil();

    var tableName = gs.action.getGlideURI().getMap().get('sysparm_refer_table') || parent.table;
    var layoutSysId = parent.sys_id;

    var formActions = uxFormActionUtil.getActionsNotInLayout(tableName, layoutSysId, uxFormActionUtil.UX_FORM_ACTION_TYPE.DECLARATIVE_ACTION);
    var formActionSysIds = formActions.map(function(action) {
        return action.sys_id;
    });

    // set query
    current.addQuery("sys_id", "IN", formActionSysIds.join());
    current.orderByDesc("specificity");
})(current, parent);
