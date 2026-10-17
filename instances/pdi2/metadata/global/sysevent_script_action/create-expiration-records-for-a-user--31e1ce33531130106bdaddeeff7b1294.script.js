if (GlideProperties.getBoolean('pwd_reset.enable.password_expiration_reminder', false)) {
    createExpirationRecords();
}

function createExpirationRecords() {
    var userSysId = event.parm1;
    var processSysIds = new PasswordResetScopedUtil().getProcessIdsByUserId(userSysId);
    var processSysId, passwordExpiryDays, expirationTime, queryString = "sys_idIN";
    queryString = queryString.concat(processSysIds);

    var processGr = new GlideRecord("pwd_process");
    processGr.addActiveQuery();
    processGr.addQuery("send_expiration_reminder", true);
    processGr.addEncodedQuery(queryString);
    processGr.query();

    while (processGr.next()) {
        try {
            new global.PwdExpirationUtils().updatePasswordExpirationDetails(userSysId, processGr.getUniqueValue());
        } catch (ex) {
            gs.error("[Script action: Create Expiration records for a user with sys_id " + userSysId + "] execution error - " + ex);
        }
    }
}
