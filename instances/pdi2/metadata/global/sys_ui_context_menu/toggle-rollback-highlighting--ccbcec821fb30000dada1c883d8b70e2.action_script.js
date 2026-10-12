// cache a few values that may not exist by the time we use them
var listId = g_list.listID;
var sysId = g_sysId;

/**
 * highlight WF Activity History rows that are part of this rollback
 * sysId - the sysId of a wf_activity_history record that is either a rollback activity, or that was rolled back
 * decorationMgr - the GlideWidgetDecorationManager instance that will handle the highlighting
 */
ScriptLoader.getScripts([
	"scripts/classes/list_decorator/CSSClassDecorator.js",
	"scripts/classes/list_decorator/RowColorDecorator.js",
	"scripts/classes/list_decorator/GlideWidgetRowDecorationManager.js"
], function() {
	setTimeout(function() {
		colorize(listId, sysId);
	}, 0);

	function colorize(listId, keyId) {
		var color = RowColorDecorator.make;
		var decorationMgr = GlideWidgetRowDecorationManager.getInstance(listId, ":rolledBack", color);

		var wmma = new GlideAjax("WorkflowModelManagerAjax");
		wmma.addParam("sysparm_name", "getRolledBackActivityIdList");
		wmma.addParam("sysparm_key_id", keyId);
		wmma.getXMLAnswer(function(answer) {
			answer = answer.evalJSON();
			if (answer.ids.length > 0) {
				decorationMgr.toggle({
					key  : answer.rollbackId,
					rows : answer.ids.concat(answer.rollbackId)
				});
			}
		});
	}
});
