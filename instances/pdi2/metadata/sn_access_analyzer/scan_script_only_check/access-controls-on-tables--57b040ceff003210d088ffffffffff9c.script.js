(function(finding) {
    var accessAuditorUtil = new sn_access_analyzer.AccessAuditorSuiteUtil();

    // Cache ACL existence per table name to avoid redundant queries when multiple custom
    // tables share the same ancestor (e.g. both extend 'task' → only query 'task' once)
    var aclCache = {};
    function tableHasAcl(tableName) {
        if (tableName in aclCache) return aclCache[tableName];
        var g_acl = new GlideRecord('sys_security_acl');
        g_acl.addQuery('name', 'CONTAINS', tableName);
        g_acl.setLimit(1);
        g_acl.query();
        aclCache[tableName] = g_acl.next();
        return aclCache[tableName];
    }

    function checkTableForACL(table) {
        if (!tableHasAcl('' + table.name) && table.sys_scope.scope != 'polaris_app_shell') {
            if (table.super_class) {
                var gr = new GlideRecord('sys_db_object');
                gr.get(table.super_class);
                checkTableForACL(gr);
            } else {
                var tableNameLink = accessAuditorUtil.getRecordLink(table, table.name);
                finding.setCurrentSource(table);
                var remediation = "Table " + tableNameLink + " is not secured with appropriate access controls, potentially allowing broader access than necessary and risking unauthorized data exposure. Remediate by implementing access controls to ensure that data in this table is limited to only the necessary audience.";
                finding.setValue("finding_details", remediation);
                finding.increment();
            }
        }
    }

    // Main loop
    var grTable = new GlideRecord("sys_db_object");
    grTable.query();
    while (grTable.next()) {
        // Skip OOB records and only evaluate customer-modified or custom records
        if (!accessAuditorUtil.isCustomRecord(grTable)) {
            continue;
        }
        checkTableForACL(grTable);
    }
    // Free memory
    aclCache = null;
})(finding);
