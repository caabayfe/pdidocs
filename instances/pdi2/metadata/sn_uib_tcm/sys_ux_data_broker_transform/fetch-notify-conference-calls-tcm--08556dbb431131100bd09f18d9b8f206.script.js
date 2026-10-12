function transform(input) {
    if (GlidePluginManager.isActive('com.snc.notify')) {
        var confUtils = new sn_uib_notify.NotifyUXFConferenceUtil();
        return confUtils.getAllConferenceCardsData(input.sysId);
    }
	return {};
}
