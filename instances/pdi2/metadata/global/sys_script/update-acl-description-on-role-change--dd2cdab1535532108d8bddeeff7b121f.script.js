(function executeRule(current, previous /*null when async*/ ) {
    // Get the parent ACL record
    var aclGr = new GlideRecord('sys_security_acl');
    if (aclGr.get(current.sys_security_acl)) {
        // Create an instance of the ACLDescriber
        var ad = new ACLDescriber();

        // Force an update of the description
        ad.ensureDescription(aclGr, true);

        // Update the ACL record with setWorkflow(false) to avoid triggering other business rules
        aclGr.setWorkflow(false);
        aclGr.update();

        // Log for troubleshooting
        gs.log("ACL Description updated for " + aclGr.name + " after role change", "ACLDescriber");
    }
})(current, previous);
