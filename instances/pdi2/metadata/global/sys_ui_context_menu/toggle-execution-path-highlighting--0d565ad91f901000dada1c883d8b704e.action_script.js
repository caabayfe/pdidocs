// cache a few values that may not exist by the time we use them
var listId = g_list.listID;
var sysId = g_sysId;
/**
 * highlight WF Activity History rows that are part of the execution path (ie. were not rolled back)
 * sysId - the sysId of a wf_activity_history record that is in the workflow context you want the execution path for
 * decorationMgr - the GlideWidgetDecorationManager instance that will handle the highlighting
 */
ScriptLoader.getScripts([
	"scripts/classes/list_decorator/CSSClassDecorator.js",
	"scripts/classes/list_decorator/RowColorDecorator.js",
	"scripts/classes/list_decorator/GlideWidgetRowDecorationManager.js"
], function() {
	//get an instance of the DecorationManager for the "executionPath" effect
	setTimeout(function() {
		colorize(listId, sysId);
	}, 0);
});

function colorize(listId, keyId) {
	var color = RowColorDecorator.make(["limegreen"]);
	var decorationMgr = GlideWidgetRowDecorationManager.getInstance(listId, ":executionPath", color);
	var wmma = new GlideAjax("WorkflowModelManagerAjax");
	wmma.addParam("sysparm_name", "getFinalExecutedActivityIdList");
	wmma.addParam("sysparm_key_id", keyId);
	wmma.getXMLAnswer(function(answer) {
		answer = answer.evalJSON();
		decorationMgr.toggle({
			key  : answer.contextId,
			rows : answer.ids
		});
	});
}
