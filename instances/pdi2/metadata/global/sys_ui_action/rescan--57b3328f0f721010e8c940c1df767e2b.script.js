function execute() {
	var ga = new GlideAjax('ScanAjaxProcessor');
	ga.addParam('sysparm_combo_id', getComboId());
	ga.addParam('sysparm_name', 'executeScanFromCombo');
	ga.getXML(renderProgress);
}

function getComboId() {
	var resultSysId = (typeof rowSysId == 'undefined') ? g_form.getUniqueValue() : rowSysId;
	var resultRecord = new GlideRecord('scan_result');
	resultRecord.get(resultSysId);

	return resultRecord.getValue('combo');
}

function renderProgress(response) {
	ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
		var scanTitle = new GwtMessage().getMessage('Execute Scan');
		var hspvUtil = new ScanProgressViewerUtil();		
		hspvUtil.renderProgress(response, scanTitle);
	});
}
