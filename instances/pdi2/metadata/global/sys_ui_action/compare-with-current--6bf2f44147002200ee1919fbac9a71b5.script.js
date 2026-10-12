/**
 * Compare Update Set Preview Problem with current version record, using standard Compare
 * modal tool, called from glide_action_list element on update set preview problem's list/form.
 */
function compareWithLocal2() {
	var sys_id = rowSysId;
	var previewProblem = new GlideRecord("sys_update_preview_problem");
	previewProblem.get(sys_id);
	var updateSetXML = new GlideRecord('sys_update_xml');
	updateSetXML.get(previewProblem.remote_update);
	
	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			if (isUISupported !== 'true') {
				var ga = new GlideAjax("DiffAjax");
				ga.addParam("sysparm_name", "diffUpdateToCurrentVersion");
				ga.addParam("sysparm_update", updateSetXML.sys_id);
				ga.getXMLAnswer(createDiffViewPane);
			}
			else {
				var returnUrlElem = gel('sysparm_referring_url');
                var returnUrl = '';
                if (returnUrlElem && returnUrlElem.value)
                    returnUrl = returnUrlElem.value;

                var url = new GlideURL("merge_form_current_update.do");
                url.addParam("sysparm_update_id", updateSetXML.sys_id);
                url.addParam("sysparm_referring_url", returnUrl);
                window.location = url.getURL();
			}
		});
	});
}
							

function createDiffViewPane(answer) {
	var dialog = new GlideBox({
		body: answer,
		title:"Compare to Local",
		height: "95%",
		width: "95%",
		autoDimensionOnLoad: 'false'
	});
	answer.evalScripts(true);
	dialog.render();
}
