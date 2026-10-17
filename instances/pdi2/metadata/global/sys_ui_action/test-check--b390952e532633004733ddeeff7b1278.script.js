function initTestScan() {
	var ga = new GlideAjax('ScanAjaxProcessor');
	var sysId = (typeof rowSysId == 'undefined') ? g_form.getUniqueValue() : rowSysId;
	ga.addParam('sysparm_sys_id', sysId);
	ga.addParam('sysparm_table_name', g_form.getTableName());
	ga.addParam('sysparm_name', 'executeTestScan');
	ga.getXML(renderProgress);
}

function renderProgress(response) {
	ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
		var scanTitle = new GwtMessage().getMessage('Execute Test Scan');
		var hspvUtil = new ScanProgressViewerUtil();
		hspvUtil.renderProgress(response, scanTitle);
	});
}
