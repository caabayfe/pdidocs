cleanUpPlatformMLReadQueryACL();

function cleanUpPlatformMLReadQueryACL() {
    if (pm.isZboot()) {
        gs.log('No need to run clean up *.* platform_ml_read query acl for zboot.');
        return;
    }
    gs.log('Started fix job for *.* platform_ml_read query acl cleanup');
    var STAR_STAR_PLATFORM_ML_READ_QUERY_RANGE_ACL_SYS_ID = 'eb94784c2bc16210b020f9806e91bf62';
    var STAR_STAR_QUERY_RANGE_ACL_PLATFORM_ML_ROLE_SYS_ID = 'f473fc88b7012210bc449a85de11a921';
    var ACL_TABLE = 'sys_security_acl';
    var ACL_ROLE_TABLE = 'sys_security_acl_role';
    var nobodyQueryAclExists = exists(ACL_TABLE, STAR_STAR_PLATFORM_ML_READ_QUERY_RANGE_ACL_SYS_ID);
    var nobodyAclRoleExists = exists(ACL_ROLE_TABLE, STAR_STAR_QUERY_RANGE_ACL_PLATFORM_ML_ROLE_SYS_ID);
    if (!nobodyQueryAclExists || !nobodyAclRoleExists) {
        gs.log('No need to continue clean up *.* platform_ml_read query acl, since platform_ml_read query acl audit record is not found.');
        return;
    }
    if (isRecordCustomized(ACL_TABLE, STAR_STAR_PLATFORM_ML_READ_QUERY_RANGE_ACL_SYS_ID) ||
        isRecordCustomized(ACL_ROLE_TABLE, STAR_STAR_QUERY_RANGE_ACL_PLATFORM_ML_ROLE_SYS_ID) ||
        isACLRoleChanged(ACL_ROLE_TABLE, STAR_STAR_PLATFORM_ML_READ_QUERY_RANGE_ACL_SYS_ID)) {
        gs.log('platform_ml_read query acl is customized, no need to clean up');
        return;
    }
    // delete non customized acl
    var deleted = deleteRecord(ACL_TABLE,STAR_STAR_PLATFORM_ML_READ_QUERY_RANGE_ACL_SYS_ID);
    gs.log('Ending fix job for *.* platform_ml_read query acl cleanup: ' + deleted);
}

function deleteRecord(table, sys_id) {
    var gr = new GlideRecord(table);
    gr.get(sys_id);
    return (deleted = gr.deleteRecord());
}

function isRecordCustomized(recordType, sysId) {
    var updateName = recordType + "_" + sysId;
    return !sn_collision.CollisionAPI.willBeReplacedOnUpgrade(updateName);
}

// check if ACL roles other than nobody is changed for this ACL, which is not covered in the above CollisionAPI check
function isACLRoleChanged(aclRoleTableName, aclRefSysId) {
    var gr = new GlideRecord('sys_update_xml');
    gr.addQuery('name', 'STARTSWITH', aclRoleTableName + "_");
    gr.addQuery('payload', "CONTAINS", aclRefSysId);
    gr.addNullQuery('remote_update_set');
    gr.setWorkflow(false);
    gr.setLimit(1);
    gr.query();
    return gr.hasNext();
}


function exists(tableName, sysId) {
    var gr = new GlideRecord(tableName);
    return gr.get(sysId);
}
