(function (finding, current) {

    // Constants
    var SYS_AUDIT = 'sys_audit';
    var SYS_SECURITY_ACL_ROLE = 'sys_security_acl_role';

    // Check to see if snc_internal has acl to sys_audit
        var invalidAccessGR = new GlideRecord(SYS_SECURITY_ACL_ROLE);
        invalidAccessGR.addEncodedQuery("sys_user_role=" + current.sys_id +
            "^sys_security_acl.active=true^sys_security_acl.advanced=false^sys_security_acl.name=" + SYS_AUDIT);
        invalidAccessGR.query();
        if (invalidAccessGR.next()) {
            // snc_internal has access to sys_audit
            finding.increment();
        }
    

})(finding, current);
