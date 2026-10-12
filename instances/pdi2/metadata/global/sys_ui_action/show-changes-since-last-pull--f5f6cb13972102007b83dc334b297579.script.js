function ShowChangesSinceLastPull() {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;

	var lcGR = new GlideRecord("sys_sync_change");
  lcGR.addQuery("sys_id", sysId);
  lcGR.query();
  if (!lcGR.next()) {
	alert(getMessage("Unable to find local change"));
	return;
  }

	//get the version attached to the local change
	var vGR = new GlideRecord("sys_update_version");
	vGR.addQuery("sys_id", lcGR.getValue("version"));
	vGR.query();
	if (!vGR.next()) {
		alert(getMessage("Unable to compare to last push/pull because version is invalid"));
		return;
	}

	//If the local change is not the current version, then we can't edit it
	if ("current" !== vGR.getValue("state")) {
		alert(getMessage("Unable to compare to last push/pull because local change is not the current version."));
		return;
	}

	//get the last sync history version
	var hGR = new GlideRecord("sys_sync_history_version");
	hGR.addQuery("sync_history.instance", lcGR.getValue("instance"));
	hGR.addQuery("version.name", vGR.getValue("name"));
	hGR.addQuery("state", "IN", "pulled, pushed, resolved");
	hGR.orderByDesc("sys_created_on");
	hGR.setLimit(1);
	hGR.query();
	if (!hGR.next()) {
		alert(getMessage("Unable to compare to last push/pull because version was never pushed or pulled. All changes are new."));
		return;
	}

	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			if (isUISupported !== 'true') {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffChangedVersionToLastPushOrPullVersion");
				ga.addParam("sysparm_table", "sys_update_version");
				ga.addParam("sysparm_localchange", sysId);
				ga.getXMLAnswer(createDiffPane);
			} else {
				var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_last_pull.do");
                url.addParam("sysparm_version_id", hGR.getValue("version"));
				url.addParam("sysparm_localchange", sysId);
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
			}
		});
	});
}

function createDiffPane(answer) {
	//if HTML, then render else show error alert
		if (answer.indexOf ("<") == -1) {
			alert(answer);
		} else {
			var dialog = new GlideBox({
			body: answer,
			title:"Compare to Last Push/Pull",
					height: "95%",
					width: "95%",
					autoDimensionOnLoad: 'false'
			});
			answer.evalScripts(true);
			dialog.render();
		}
}
