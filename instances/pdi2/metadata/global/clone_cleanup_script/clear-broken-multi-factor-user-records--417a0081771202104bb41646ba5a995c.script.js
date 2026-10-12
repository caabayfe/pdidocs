/*
    ======================================================================================================
    After the instance is cloned, if the user record which was present earlier in the target but removed 
	after clone, for those user records, the multi factor auth tables will have the broken reference in these
	tables - security_nonce, user_multifactor_auth and sys_user_multi_factor_setup. This script is to identify
	such records from these tables and delete the identified broken records itself from the target instance.
    ======================================================================================================
*/
this.logInfo("Started running post clone cleantup script - Clear Broken Multi Factor User Records");
try {
    removeBrokenUserRecordsFromTable('security_nonce');
    removeBrokenUserRecordsFromTable('user_multifactor_auth');
    removeBrokenUserRecordsFromTable('sys_user_multi_factor_setup');
    removeBrokenUserRecordsFromTable('sys_user_public_credential');
    this.logInfo("Completed running script Fix Multi Factor Tables");
} catch (e) {
    this.logError("Exception occured while running script Clear Broken Multi Factor User Records: " + e.message);
    this.logError(e);
}

function removeBrokenUserRecordsFromTable(tableName){
    var glideRecord = new GlideRecord(tableName);
    if (!glideRecord.isValid())
        return;

    glideRecord.addEncodedQuery("userISNOTEMPTY^user.sys_idISEMPTY");
    glideRecord.query();
    if(!glideRecord.next())
        return;

    glideRecord.deleteMultiple();
    this.logInfo("Fixed broken user records in table : " + tableName);
}

function logInfo(message) {
    gs.info("post_clone: Multi Factor Auth: " + message);
}

function logError(message) {
    gs.error("post_clone: Multi Factor Auth: " + message);
}
