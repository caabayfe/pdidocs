/**
 * Compare Update Set Preview Problem with current version record, using standard Compare
 * modal tool, called from glide_action_list element on update set preview problem's list/form.
 */
function mergeUpdates() {
	var id = rowSysId;
	
	var previewProblem = new GlideRecord("sys_update_preview_problem");
	previewProblem.get(id);
	
	var updateSetXML = new GlideRecord('sys_update_xml');
	updateSetXML.get(previewProblem.remote_update);
	
	var rus = new GlideRecord("sys_remote_update_set");
	rus.get(updateSetXML.remote_update_set);
	var rbusId = rus.remote_base_update_set;
	
	ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
		var ga0 = new GlideAjax('DiffMergeUICheck');
		ga0.addParam('sysparm_name', 'isUISupported');
		ga0.getXMLAnswer(function (isUISupported) {
			var tableName = (new RecordPayloadUtil()).getTableNameFromUpdateName(updateSetXML.getValue("name"));
			if (isUISupported !== 'true' || (new RecordPayloadUtil()).isMergeBlackListed(tableName)) {
				alert("Not supported");
			}
			else {
				window.location = "merge_form_collision_update.do?" +
					"sysparm_update_id1=" + updateSetXML.sys_id +
					"&sysparm_update_name=" + updateSetXML.name +
					"&sysparm_rbus=" + rbusId;
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
