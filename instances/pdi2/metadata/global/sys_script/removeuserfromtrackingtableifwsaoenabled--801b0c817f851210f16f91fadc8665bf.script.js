(function executeRule(current, previous /*null when async*/ ) {
    var mfaEnfocementGr = new GlideRecord('sys_user_mfa_enforcement_info');
    if (!mfaEnfocementGr.isValid())
        return;
    mfaEnfocementGr.addQuery("user", current.sys_id);
    mfaEnfocementGr.addQuery("user_category", 'hybrid');
    mfaEnfocementGr.query();

    //nothing to do if the record is not present.
    if (!mfaEnfocementGr.next())
        return;

    //if present, remove the record.
    var status = mfaEnfocementGr.status;
	gs.debug(gs.getMessage("The user: {0} is marked as Web Service Access Only, deleting the corresponding record with status: {1} in the table: {2}", [current.user_name, status, 'sys_user_mfa_enforcement_info']));
	mfaEnfocementGr.deleteRecord();

    //remove this user record from the cache as well..
    GlideCacheManager.remove('hybrid_users_cache', current.user_name);

})(current, previous);
