(function executeRule(current, previous /*null when async*/ ) {

    var utils = new SDProcessOptimizationHelperUtils();
    var gr = new GlideRecord(SDConstants.tableNames.POPROJECT);
    gr.addQuery('source', SDConstants.POPROJECTSOURCE);
    gr.query();
    switch (current.operation()) {
        case "insert":
            while (gr.next())
                utils.addPermissionToPOProject(gr.sys_id, current.user);
            break;
        case "delete":
            var roleSysIds = [];
            roleSysIds.push(SDConstants.SDREADROLESYSID);
            roleSysIds.push(SDConstants.SDDETAILSREADROLESYSID);
            roleSysIds.push(SDConstants.SDADMINROLESYSID);
            var roleGr = new GlideRecord(current.getTableName());
            roleGr.addQuery("user", current.user);
            roleGr.addQuery("role.sys_id", "IN", roleSysIds);
            roleGr.query();
            if (!roleGr.next()) {
                while (gr.next())
                    utils.removePermissionToPOProject(gr.sys_id, current.user);
            }
            break;
    }

})(current, previous);
