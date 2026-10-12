var ProminFindingDefUtilSNC = Class.create();
ProminFindingDefUtilSNC.prototype = {
    initialize: function() {
    },

    isProcessConfig: function(grProject) {
        var parentTable = this._getparentTable(grProject.getUniqueValue());
        return parentTable && this._isProcessConfigPresent(parentTable);
    },
	
	isProcessRegularFindingPresent: function(grProject) {
		var parentTable = this._getparentTable(grProject.getUniqueValue());
        var grFindingDef = new GlideRecord("promin_finding_def");
        grFindingDef.addQuery("type", "PROCESS");
        grFindingDef.addQuery("process_def.table", parentTable);
        grFindingDef.query();
        return grFindingDef.hasNext();
    },
	
	isProcessAutomatedFindingPresent: function(grProject) {
		var parentTable = this._getparentTable(grProject.getUniqueValue());
        var grFindingDef = new GlideRecord("promin_automated_finding");
		grFindingDef.addNotNullQuery("process_def");
        grFindingDef.addQuery("process_def.table", parentTable);
        grFindingDef.query();
        return grFindingDef.hasNext();
    },

    _getparentTable: function(projectId) {
        var grEntity = new GlideRecord("promin_project_entity");
        grEntity.addQuery("project", projectId);
        grEntity.addNullQuery("parent_entity");
        grEntity.query();
        var entityCount = grEntity.getRowCount();
        var table = "";
        if (entityCount == 1 && grEntity.next()) {
            table = grEntity.getValue("table");
        }
		return table;
    },

    _isProcessConfigPresent: function(table) {
        var grProcessConfig = new GlideRecord("promin_process_def");
        grProcessConfig.addQuery("table", table);
		grProcessConfig.addQuery("content_pack", false);
        grProcessConfig.query();
        return grProcessConfig.hasNext();
    },
	
    type: 'ProminFindingDefUtilSNC'
};
