(function executeRule(current, previous /*null when async*/ ) {
    var aclSysId = current.sys_security_acl;
    var acl = new GlideRecord('sys_security_acl');
    if (acl.get(aclSysId)) {
        var tableName = ('' + acl.name).split('.')[0];
        if (tableName != '*' && acl.type == 'record' && acl.operation == 'read') {
            // schedule a batch job to re-generate query_range ACLs for this table
            /*var gr = new GlideRecord('sys_trigger');
            gr.name = "Adjust query_range ACLs";
            gr.script = "var tables = ['" + tableName + "']; (new global.QueryRangeACLAuditor()).auditQueryRangeACLs(tables);";
            gr.trigger_type = 0; // run once
            gr.insert();*/
        } else if (tableName != '*' && acl.type == 'record' && (acl.operation == 'e66cf897b7300210240b06dd1e11a9fd' || acl.operation == '7aad4c50b7f4621062b62181ce11a918')) {
            // mark the ACL as customized to prevent re-generating query_range ACLs for query_range and conditional_table_query_range
            acl.description += ' - customized roles';
            acl.update();
        }
    }
})(current, previous);
