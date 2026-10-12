(function executeRule(current, previous /*null when async*/ ) {

    function forSourceScope() {
        var rcaGa = new GlideRecord("sys_restricted_caller_access");
        rcaGa.addQuery("source_scope", current.getUniqueValue());
        rcaGa.addQuery("sys_scope", "SAMEAS", "target_scope");
        rcaGa.addQuery("status", "0");
        rcaGa.chooseWindow(0, 3, true);
        rcaGa.query();

        if (!rcaGa.hasNext())
            return;

        var appList = [];
        while (rcaGa.next())
            appList.push(rcaGa.getDisplayValue('target_scope'));

        if (rcaGa.getRowCount() > 3)
            appList.push('...');


        gs.addErrorMessage(gs.getMessage("This application '{0}' has requested <a target='_blank' href='{2}'>{3} Restricted Caller Access Privileges</a> which are pending '{1}' application(s) admin review. Until approved, this may result in the degraded functionality of this application. Please contact your administrator.", [current.getValue('name'), GlideStringUtil.join(appList, ", "), rcaGa.getTableName() + "_list.do?sysparm_query=" + rcaGa.getEncodedQuery(), rcaGa.getRowCount()]));

    }

    function forTargetScope() {
        var gr = new GlideRecord("sys_restricted_caller_access");
        gr.addQuery("target_scope", current.getUniqueValue());
        gr.addQuery("sys_scope", "SAMEAS", "target_scope");
        gr.addQuery("status", "0");
        gr.setLimit(1);
        gr.query();

        if (gr.next()) {
            gs.addErrorMessage(gs.getMessage("Some applications have requested Restricted Caller Access Privileges</a> for resources in this application '{0}'. <a target='_blank' href='{1}'>Click here</a> to review Restricted Caller Access Privileges which are in 'Requested' status.", [current.getValue('name'), gr.getTableName() + "_list.do?sysparm_query=" + gr.getEncodedQuery()]));
        }
    }

    forSourceScope();
    forTargetScope();

})(current, previous);
