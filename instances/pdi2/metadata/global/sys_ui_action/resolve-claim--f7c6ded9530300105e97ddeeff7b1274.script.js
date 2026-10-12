function mergeFormClaimConflict() {

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
				ga.addParam("sysparm_name", "diffHistoryLogToCurrentUpdate");
				ga.addParam("sysparm_history_log", sysId);
				ga.getXMLAnswer(createDiffPane);
			} else {
				var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_claim_conflict.do");
                url.addParam("sysparm_upgrade_history_log_id", sysId);
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
			}
		});
	});
}

function createDiffPane(answer) {
    var dialog = new GlideBox({
		body: answer,
		title:"Compare to Current",
        height: "95%",
        width: "95%",
        autoDimensionOnLoad: 'false'
    });
    answer.evalScripts(true);
    dialog.render();
}
