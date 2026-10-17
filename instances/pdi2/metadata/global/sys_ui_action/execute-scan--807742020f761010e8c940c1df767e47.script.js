var FAILED_CODE = 1;

function execute() {
	var ga = new GlideAjax('ScanAjaxProcessor');
	ga.addParam('sysparm_combo_id', g_form.getUniqueValue());
	ga.addParam('sysparm_name', 'executeScanFromCombo');
	ga.getXML(renderProgress);
}

function renderProgress(response) {		
	ScriptLoader.getScripts('/scripts/ScanProgressViewerUtil.js', function() {
		var scanTitle = new GwtMessage().getMessage('Execute Scan');
		var hspvUtil = new ScanProgressViewerUtil();		
		hspvUtil.renderProgress(response, scanTitle);
	});
}
