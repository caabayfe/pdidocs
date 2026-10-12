function compareToCurrent() {
	if (typeof rowSysId == 'undefined')
		sysId = gel('sys_uniqueValue').value;
	else
		sysId = rowSysId;

	var gr = new GlideRecord("sys_sync_history_version");
	gr.addQuery("sys_id", sysId);
	//gr.addQuery("state","push_committing");
	gr.query();
	if (!gr.next())
		return;

	if (gr.getValue("state") == "collision") {
		alert(getMessage("Use Resolve Collision instead when version is in Collision state"));
		return;
	}


	var vgr = new GlideRecord("sys_update_version");
  vgr.addQuery("sys_id", gr.getValue("version"));
  vgr.query();
  if (!vgr.next())
   return;

  ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			var tableName = (new RecordPayloadUtil()).getTableNameFromUpdateName(vgr.getValue("name"));
			if (isUISupported !== 'true' || (new RecordPayloadUtil()).isMergeBlackListed(tableName)) {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffPushedVersionToCurrentVersion");
				ga.addParam("sysparm_version", gr.version);
				ga.getXMLAnswer(createDiffViewPane);
			}
			else {
				var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_current_version.do");
                url.addParam("sysparm_version_id", gr.getValue("version") );
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
			}
		});
	});
}

function createDiffViewPane(answer) {
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
