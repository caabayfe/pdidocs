function showProgress() {
	var sysId = ((typeof rowSysId == 'undefined') || rowSysId === null) ? g_form.getUniqueValue() : rowSysId;
	ScriptLoader.getScripts('/scripts/PickABrowser/PickABrowserUtil.js', function() {
		var pabUtil = new PickABrowserUtil();
		pabUtil.viewTestProgress(sysId);
	});
}
