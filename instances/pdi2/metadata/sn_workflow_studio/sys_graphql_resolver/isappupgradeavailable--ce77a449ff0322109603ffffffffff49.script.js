(function process( /*ResolverEnvironment*/ env) {
	var AppUpgradeInfo = {
	current: '',
	latest: '',
	isUpgradable: false
	};
	var pluginName = env.getArguments().builder_name;
    var gr = new GlideRecord('sys_store_app');
	gr.addQuery('scope', pluginName);
	gr.query();
	if (gr.next()) {
		AppUpgradeInfo.current = gr.getValue('version');
		AppUpgradeInfo.latest = gr.getValue('latest_version');
		var versionComparator = new sn_appclient.VersionComparator();
		AppUpgradeInfo.isUpgradable = versionComparator.isUpgrade(AppUpgradeInfo.current, AppUpgradeInfo.latest);
		return AppUpgradeInfo;
	}
	return AppUpgradeInfo;
})(env);
