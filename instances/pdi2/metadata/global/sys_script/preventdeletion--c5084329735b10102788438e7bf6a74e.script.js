preventDeletion();

function preventDeletion() {
	var default_policy_sysid = "3054afe6737a3300616ca9843cf6a735";
    if (current.sys_id == default_policy_sysid) {
        gs.addErrorMessage(gs.getMessage("Cannot delete the default password policy."));
        current.setAbortAction(true);
        return;
    }
    var credGr = new GlideAggregate('pwd_cred_store');
    credGr.addActiveQuery();
    credGr.addQuery('password_policy', current.sys_id);
    credGr.addAggregate('COUNT');
    credGr.query();
    var rowCount = 0;
    if (credGr.next())
        rowCount = credGr.getAggregate('COUNT');
    if (rowCount > 0) {
        gs.addErrorMessage(gs.getMessage("Cannot delete the password policy because it is part of one or more active credential stores."));
		current.setAbortAction(true);
	}
}
