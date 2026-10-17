var GFGoalAssignedEntityConfigSNC = Class.create();
GFGoalAssignedEntityConfigSNC.prototype = {
    initialize: function(assignedEntityTable, assignedEntityField) {
        this.assignedEntityTable = assignedEntityTable;
        this.assignedEntityField = assignedEntityField;
    },

    isValidConfig: function() {
        var assignedEntityConfig = {
            "isValid": true,
            "errorMsg": ""
        };
        if (!sn_gf.GFUtil.isValidTable(this.assignedEntityTable)) {
            assignedEntityConfig["isValid"] = false;
            assignedEntityConfig["errorMsg"] = gs.getMessage("The Assigned entity table is invalid.");
        } else if (global.JSUtil.notNil(this.assignedEntityField) && !sn_gf.GFUtil.isValidEnterpriseGoalField(this.assignedEntityField, false)) {
            var goalTableLabel = sn_gf.GFUtil.getTableLabel(sn_gf.GoalFrameworkConstants.GOAL_TABLE);
			assignedEntityConfig["isValid"] = false;
            assignedEntityConfig["errorMsg"] = gs.getMessage("The Assigned entity field value does not exist on the {0} [sn_gf_goal] table.", [goalTableLabel]);
        } else if (global.JSUtil.notNil(this.assignedEntityField) && sn_gf.GFUtil.getReferencedTable(sn_gf.GoalFrameworkConstants.GOAL_TABLE, this.assignedEntityField) != this.assignedEntityTable) {
            assignedEntityConfig["isValid"] = false;
            assignedEntityConfig["errorMsg"] = gs.getMessage("The Assigned entity field value does not refer to the Assigned entity table.");
        }
        return assignedEntityConfig;
    },
	
	hasConfig: function() {
		var goalAssignedEntityConfigGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
		goalAssignedEntityConfigGr.addQuery("assigned_entity_table", this.assignedEntityTable);
		goalAssignedEntityConfigGr.query();
		return goalAssignedEntityConfigGr.hasNext();
	},
    type: 'GFGoalAssignedEntityConfigSNC'
};

GFGoalAssignedEntityConfigSNC.doesAnotherGoalAssignedEntityConfigExist = function(table, currentGoalAssignedEntityConfigId) {
	var goalAssignedEntityConfigGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
	goalAssignedEntityConfigGr.addQuery("assigned_entity_table", table);
	goalAssignedEntityConfigGr.addQuery("sys_id", "!=", currentGoalAssignedEntityConfigId);
	goalAssignedEntityConfigGr.query();
	return goalAssignedEntityConfigGr.hasNext();
};

GFGoalAssignedEntityConfigSNC.getAssignedEntityTableFromField = function(goalField) {
	if(gs.nil(goalField))
		return '';
	var goalAssignedEntityConfigGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
	goalAssignedEntityConfigGr.addQuery("assigned_entity_field", goalField);
	goalAssignedEntityConfigGr.query();
	if(goalAssignedEntityConfigGr.next()) {
		return goalAssignedEntityConfigGr.getValue('assigned_entity_table');
	}
	return '';
};

GFGoalAssignedEntityConfigSNC.getGoalFieldFromAssignedEntityType = function(assignedEntityType) {
	if(gs.nil(assignedEntityType))
		return '';
	var goalAssignedEntityConfigGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
	goalAssignedEntityConfigGr.addQuery("assigned_entity_table", assignedEntityType);
	goalAssignedEntityConfigGr.setLimit(1);
	goalAssignedEntityConfigGr.query();
	if(goalAssignedEntityConfigGr.next()) {
		return goalAssignedEntityConfigGr.getValue('assigned_entity_field');
	}
	return '';
};

GFGoalAssignedEntityConfigSNC.seedAssignedEntityConfig = function(table, field) {
    var gaecGR = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
    gaecGR.addQuery("assigned_entity_table", table);
    gaecGR.query();
    if (gaecGR.next()) {
        return null;
    } else {
        gaecGR.initialize();
        gaecGR.setValue("assigned_entity_table", table);
        gaecGR.setValue("assigned_entity_field", field);
        return gaecGR.insert();
    }
};
