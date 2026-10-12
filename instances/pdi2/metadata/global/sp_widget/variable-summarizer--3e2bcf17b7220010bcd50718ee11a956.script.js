(function() {
    data.label = options.label || gs.getMessage("Options");
    if (options.task)
        data.ariaLabel = gs.getMessage("{0} for {1}", [data.label, options.task]);
    else
        data.ariaLabel = data.label;

    data.labelClose = gs.getMessage("Close");
    data.clickToView = gs.getMessage("Click to view {0}");

    if (options.variables) {
        data.variables = filterVariables(options.variables);
        return;
    }

    var tableName = options.table || $sp.getParameter('table');
    var sysId = options.sys_id || $sp.getParameter('sys_id');

    if (!new global.SPWidgetAccessControl().hasPublicAccess(tableName, $sp, options, input)) {
        gs.warn("Deny access to table which is not public: " + tableName);
        data.isValid = false;
        return;
    }

    var record = sn_std_tkt_api.TicketConfig.getTicketRecord(tableName, sysId);

    if (record == null)
        return;

    data.canRead = record.canRead();
    if (!data.canRead)
        return;

    data.variables = filterVariables(new GlobalServiceCatalogUtil().getVariablesForTask(record, true));

})();

function filterVariables(variables) {
    if (variables == null || variables.length == 0)
        return variables;

    var filteredVariables = [];
    variables.forEach(function(variable) {
        if (variable.visible_summary)
            filteredVariables.push(variable);
    });

    return filteredVariables;
}
