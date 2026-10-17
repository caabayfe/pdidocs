(function executeRule(current, previous /*null when async*/ ) {
    if (!current || current.isNewRecord()) // to prevent null pointer exceptions.
        return;

    var table = current.table;
    var view = current.view.getValue("sys_id");
    var workspace = current.workspace.getValue("sys_id");

    var orderList = new WorkspaceFormsTabsList().getListArray(table, view, workspace);
    g_scratchpad.orderList = orderList;

})(current, previous);
