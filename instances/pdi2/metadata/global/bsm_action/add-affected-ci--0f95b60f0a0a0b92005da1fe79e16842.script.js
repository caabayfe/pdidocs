var g_map_window = window.parent;
var g_opener_window = g_map_window.opener;
var g_opener = (g_opener_window && g_opener_window.GJSV? g_opener_window.getMainWindow() : null);

if(g_opener && g_opener.g_form) {
	var f = g_opener.g_form;
	var task_id = f.getValue('sys_uniqueValue'); 

	if (task_id) {
		for (var key in this.diagram.nodes) {
			var n = this.diagram.nodes[key];
			if (n.isActive() && (n.getData('is_collapsed') != 'true')) {
				var cmdb_id = n.getID();
				addAffectedCI(task_id, cmdb_id);
			}
		}
	}

	if(typeof(g_opener.refreshList) == "function") {
		g_opener.refreshList('task_ci');
		
	} else if(g_opener.GlideList2) {
		var lists = g_opener.GlideList2.getListsForTable('task_ci');
		for (var i = 0; i < lists.length; i++)
			lists[i].refresh();
	}
	
	alert("Affected CIs added");		
}

// create a relation between a task and a CI
function addAffectedCI(task_id, cmdb_id) {
        var affectedCI = new GlideRecord('task_ci');
        affectedCI.task = task_id;
        affectedCI.ci_item = cmdb_id;
        affectedCI.insert();
}
