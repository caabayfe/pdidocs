function mergeFormUpgrade() {

		if (typeof rowSysId == 'undefined')
			sysId = gel('sys_uniqueValue').value;
		else
			sysId = rowSysId;

	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			if (isUISupported !== 'true') {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffBaseAndCopiedRecords");
				ga.addParam("sysparm_sys_id", sysId);
				ga.getXMLAnswer(createDiffPane);
			} else {
				var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_upgrade.do");
                url.addParam("sysparm_upgrade_history_log_id", sysId);
				url.addParam("sysparm_basechanged", "true");
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
			}
		});
	});
}

function createDiffPane(answer) {
    var dialog = new GlideBox({
		body: answer,
		title:"Compare Copied Record to Update Base Record",
        height: "95%",
        width: "95%",
        autoDimensionOnLoad: 'false'
    });
    answer.evalScripts(true);
    dialog.render();
}
