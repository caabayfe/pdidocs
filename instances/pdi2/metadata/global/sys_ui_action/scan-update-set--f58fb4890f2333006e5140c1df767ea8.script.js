function initUpdateSetScan() {	
	var ga = new GlideAjax('ScanAjaxProcessor');
	var sysId = (typeof rowSysId == 'undefined')? g_form.getUniqueValue() : rowSysId;
	var tableName = g_form.getTableName();
	ga.addParam('sysparm_sys_id', sysId);
	ga.addParam('sysparm_name', 'executeUpdateSetScan');
	ga.getXML(renderProgress);
}

function renderProgress(response) {
	ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
		var scanTitle = new GwtMessage().getMessage('Execute Update Set Scan');
		var hspvUtil = new ScanProgressViewerUtil();
		hspvUtil.renderProgress(response, scanTitle);
	});
}
