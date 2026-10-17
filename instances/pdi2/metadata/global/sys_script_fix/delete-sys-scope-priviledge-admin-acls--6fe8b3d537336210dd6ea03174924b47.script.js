var ADMIN_ROLE_ID = '2831a114c611228501d4ea6c309d626d';
var PRIVILEGE_TABLE = 'sys_scope_privilege';
var ACL_ROLE_TABLE = 'sys_security_acl_role';
var ACL_TABLE = 'sys_security_acl';
var OPERATION = "Granular Admin Role for " + PRIVILEGE_TABLE + ". Deleting ACLs for admin";

gs.info(OPERATION + ": start");
var gr = new GlideRecord(ACL_ROLE_TABLE);
gr.addEncodedQuery('sys_security_acl.name=' + PRIVILEGE_TABLE + '^ORsys_security_acl.nameSTARTSWITH' + PRIVILEGE_TABLE + '.');
gr.addQuery('sys_user_role', ADMIN_ROLE_ID);
gr.query();
var sysIds = [];
while (gr.next()) {
    var aclSysId = gr.sys_security_acl.sys_id;
    if (!isAclCustomerChanged(aclSysId)) {
        gs.info('ACL to be deleted: ' + gr.sys_security_acl.name + ' (sys_id: ' + aclSysId + ', operation: ' + gr.sys_security_acl.operation + ')');
        sysIds.push(aclSysId);
    }
}

gs.info('Total ACL records to be deleted: ' + sysIds.length + ' (' + sysIds.join(',') + ')');

if (sysIds.length > 0) {
    var aclGr = new GlideRecord(ACL_TABLE);
    aclGr.addQuery('sys_id', 'IN', sysIds.join(','));
    aclGr.query();
    aclGr.deleteMultiple();
}

gs.info(OPERATION + ": end");


function isAclCustomerChanged(aclSysId) {
    // Checking if the ACL has an entry in sys_update_xml, which means it's either created or modified.
    var updateXmlGr = new GlideRecord("sys_update_xml");
    updateXmlGr.addQuery("name", ACL_TABLE + "_" + aclSysId);
    updateXmlGr.query();
    if (updateXmlGr.next()) {
        gs.info("ACL " + aclSysId + " has been modified by the customer. It will not be deleted.");
        return true;
    }


    // Checking if the ACL has any roles added besides the admin that we just retrieved.
    var aclCount = new GlideAggregate(ACL_ROLE_TABLE);
    aclCount.addQuery("sys_security_acl", aclSysId);
    aclCount.addAggregate("COUNT");
    aclCount.query();
    if (aclCount.next()) {
        var count = aclCount.getAggregate('COUNT');
        if (count > 1) {
            gs.info("ACL " + aclSysId + " has extra roles assigned to it. It will not be deleted.");
            return true;
        }
    }
    return false;
}
