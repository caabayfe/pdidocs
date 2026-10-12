function mergeFormCurrentVersion() {
	if (typeof rowSysId == 'undefined')
			sysId = gel('sys_uniqueValue').value;
		else
			sysId = rowSysId;

	var gr = new GlideRecord("sys_update_version");
  gr.addQuery("sys_id", sysId);
  gr.query();
  if (!gr.next())
   return;

	if (gr.getValue("state") == "current") {
		alert(getMessage("This is the current version, there is nothing to compare."));
		return;
	}

	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			if (isUISupported !== 'true' ) {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffToCurrentVersion");
				ga.addParam("sysparm_version", sysId);
				ga.getXMLAnswer(createDiffPane);
			} else {
                var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_current_version.do");
                url.addParam("sysparm_version_id", sysId);
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
			}
		});
	});
}

function createDiffPane(answer) {
	// show as message to user if answer does not contain payload
	if (answer.indexOf("<") == -1)
		alert(answer);
	else {
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
}
