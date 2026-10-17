(function executeRule(current, previous /* null when async */) {
	// eslint-disable-next-line no-undef
	if (GlidePluginManager.isActive('sn_ent') && sn_ent.EnterpriseContentEAMUtils.isEnterpriseClassAsset(current.sys_class_name)) {
		g_scratchpad.nonMandatoryInstallStatus = ['11', '2'];
	} else {
		g_scratchpad.nonMandatoryInstallStatus = [];
	}
}(current, previous));
