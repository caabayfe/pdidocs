var GFGoalRelationshipSNC = Class.create();
GFGoalRelationshipSNC.prototype = {
    initialize: function(goalId, targetId, workItemType, workItemId) {
        this.goalId = goalId;
        this.targetId = GlidePluginManager.isActive('sn_gfa') ? targetId : '';
        this.workItemType = workItemType;
        this.workItemId = workItemId;
        this.goalRelationshipGr = null;
        this.goalRelationshipId = '';
        if (goalId != null && workItemId != null)
            this.goalRelationshipGr = this.getGoalRelationshipGr();
        if (this.goalRelationshipGr != null)
            this.goalRelationshipId = this.goalRelationshipGr.getUniqueValue();
    },
    getGoalRelationshipGr: function() {
        if (this.goalRelationshipGr != null)
            return this.goalRelationshipGr;
        var workItemField = (this.workItemType in GFGoalRelationshipSNC.tableToFieldMapping) ? GFGoalRelationshipSNC.tableToFieldMapping[this.workItemType] : 'planning_item_id';
        var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationshipGr.addQuery('goal', this.goalId);
        if (GlidePluginManager.isActive('sn_gfa'))
            goalRelationshipGr.addQuery('target', this.targetId);
        goalRelationshipGr.addQuery(workItemField, this.workItemId);
        goalRelationshipGr.query();
        if (goalRelationshipGr.next())
            return goalRelationshipGr;
        return this.getGoalRelationshipGrUsingEntityId();
    },

    getGoalRelationshipGrUsingEntityId: function() {
        if (this.goalRelationshipGr != null)
            return this.goalRelationshipGr;
        var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationshipGr.addQuery('goal', this.goalId);
        if (GlidePluginManager.isActive('sn_gfa'))
            goalRelationshipGr.addQuery('target', this.targetId);
        goalRelationshipGr.addQuery('entity_id', this.workItemId);
        goalRelationshipGr.query();
        if (goalRelationshipGr.next())
            return goalRelationshipGr;
        return null;
    },

    createGoalRelationship: function(goalId, targetId, workItemType, workItemId, isPrimaryGoal) {
        var workItemField = (workItemType in GFGoalRelationshipSNC.tableToFieldMapping) ? GFGoalRelationshipSNC.tableToFieldMapping[workItemType] : 'planning_item_id';
        if (workItemField == "planning_item_id" && GlidePluginManager.isActive('com.sn_align_core') && !sn_gf.GFAlignCoreUtil.isValidPlanningItem(workItemId)) {
            workItemType = sn_gf.GFAlignCoreUtil.getPlanningItemSysClassName(workItemId);
            this.goalRelationshipId = sn_gf.GFGoalRelationshipSNC.createGoalRelationshipWithEntity(goalId, targetId, workItemType, workItemId, isPrimaryGoal);
        } else {
            var insertedRelationship = sn_gf.GFGoalRelationshipSNC.createGoalRelationshipWithWorkItemField(goalId, targetId, workItemField, workItemId, isPrimaryGoal);
            this.goalRelationshipId = insertedRelationship.insertedId;
            this.goalRelationshipGr = insertedRelationship.insertedGr;
        }
        this.goalId = goalId;
        this.targetId = targetId;
        this.workItemType = workItemType;
        this.workItemId = workItemId;
    },

    hasAnotherWorkItemRelationship: function(onSameGoal = false) {
        var workItemField = (this.workItemType in GFGoalRelationshipSNC.tableToFieldMapping) ? GFGoalRelationshipSNC.tableToFieldMapping[this.workItemType] : 'planning_item_id';
        var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationshipGr.addQuery(workItemField, this.workItemId);
        if (onSameGoal)
            goalRelationshipGr.addQuery('goal', this.goalId);
        goalRelationshipGr.setLimit(2);
        goalRelationshipGr.query();
        while (goalRelationshipGr.next()) {
            if (goalRelationshipGr.getUniqueValue() != this.goalRelationshipId) {
                return true;
            }
        }
        return this.hasAnotherEntityRelationship(onSameGoal);
    },

    hasAnotherEntityRelationship: function(onSameGoal = false) {
        var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationshipGr.addQuery('entity_id', this.workItemId);
        if (onSameGoal)
            goalRelationshipGr.addQuery('goal', this.goalId);
        goalRelationshipGr.setLimit(2);
        goalRelationshipGr.query();
        while (goalRelationshipGr.next()) {
            if (goalRelationshipGr.getUniqueValue() != this.goalRelationshipId) {
                return true;
            }
        }
        return false;
    },

    hasAnotherWorkItemRelationshipOnSameGoal: function() {
        return this.hasAnotherWorkItemRelationship(true);
    },

    deleteGoalRelationship: function() {
        if (this.goalRelationshipGr != null) {
            this.goalRelationshipGr.deleteRecord();
            this.goalRelationshipGr = null;
            this.goalRelationshipId = '';
        }
    },

    deleteTargetRelationship: function() {
        if (GlidePluginManager.isActive('sn_gfa') &&
            this.goalRelationshipGr != null &&
            this.goalRelationshipGr.isValidField('target')) {

            this.goalRelationshipGr.setValue('target', '');
            this.goalRelationshipGr.update();
            this.targetId = '';
        }
    },

    copyGoalRelationshipforCopiedItem: function(oldItemSysId, newItemSysId) {
        var goalRelationGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        goalRelationGr.addQuery('planning_item_id', oldItemSysId);
        goalRelationGr.query();
        while (goalRelationGr.next()) {
            var goalId = goalRelationGr.getValue('goal');
            var targetId = GlidePluginManager.isActive('sn_gfa') ? goalRelationGr.getValue('target') : '';
            var isPrimaryGoal = goalRelationGr.getValue('is_primary_goal');
            sn_gf.GFGoalRelationshipSNC.createGoalRelationshipWithWorkItemField(goalId, targetId, 'planning_item_id', newItemSysId, isPrimaryGoal);
        }
    },

    isPrimaryGoalChecked: function() {
        if (this.goalRelationshipGr != null)
            return this.goalRelationshipGr.getValue('is_primary_goal') == "1";
        return false;
    },

    makeGoalRelationshipPrimary: function() {
        if (this.goalRelationshipGr != null) {
            this.goalRelationshipGr.setValue('is_primary_goal', true);
            this.goalRelationshipGr.update();
        }
    },

    type: 'GFGoalRelationshipSNC'
};

GFGoalRelationshipSNC.isDeletionOfPrimaryGoalAllowed = function(glideRecord) {
    if (!glideRecord.isValid() || (glideRecord.isValidField('entity_id') && !glideRecord.getValue('entity_id')))
        return true;
    var goalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    if (goalRelationshipGr.isValid()) {
        goalRelationshipGr.addQuery('table_name', glideRecord.getValue('table_name'));
        goalRelationshipGr.addQuery('entity_id', glideRecord.getValue('entity_id'));
        goalRelationshipGr.addQuery('is_primary_goal', false);
        goalRelationshipGr.query();
        if (goalRelationshipGr.hasNext())
            return false;
    }
    return true;
};

GFGoalRelationshipSNC.getWorkItemTableName = function(glideRecord) {
    if (GFUtil.isInstanceOf(glideRecord.getTableName(), 'dmn_demand'))
        return 'dmn_demand';
    if (GFUtil.isInstanceOf(glideRecord.getTableName(), 'pm_project'))
        return 'pm_project';
    if (GFUtil.isInstanceOf(glideRecord.getTableName(), 'pm_program'))
        return 'pm_program';
    if (GFUtil.isInstanceOf(glideRecord.getTableName(), 'rm_epic'))
        return 'rm_epic';
    if (GFUtil.isInstanceOf(glideRecord.getTableName(), 'sn_safe_epic'))
        return 'sn_safe_epic';
    if (GFUtil.isInstanceOf(glideRecord.getTableName(), 'rm_feature'))
        return 'rm_feature';
    return '';
};

GFGoalRelationshipSNC.tableToFieldMapping = {
    'dmn_demand': 'demand',
    'pm_project': 'project',
    'pm_program': 'program',
    'rm_epic': 'scrum_epic',
    'sn_safe_epic': 'scrum_epic',
    'rm_feature': 'scrum_feature',
};

GFGoalRelationshipSNC.checkGoalRelationshipRec = function(goalId, targetId, workItemType, itemId, isPrimaryGoal) {
    var workItemField = (workItemType in GFGoalRelationshipSNC.tableToFieldMapping) ? GFGoalRelationshipSNC.tableToFieldMapping[workItemType] : 'planning_item_id';
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    goalRelationshipGr.addQuery('goal', goalId);
    if (GlidePluginManager.isActive('sn_gfa'))
        goalRelationshipGr.addQuery('target', targetId);
    goalRelationshipGr.addQuery(workItemField, itemId);
    goalRelationshipGr.addQuery('is_primary_goal', isPrimaryGoal);
    goalRelationshipGr.query();
    if (goalRelationshipGr.hasNext())
        return true;
    return GFGoalRelationshipSNC.checkGoalRelationshipRecUsingEntityId(goalId, targetId, itemId, isPrimaryGoal);
};


GFGoalRelationshipSNC.checkGoalRelationshipRecUsingEntityId = function(goalId, targetId, itemId, isPrimaryGoal) {
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    goalRelationshipGr.addQuery('goal', goalId);
    if (GlidePluginManager.isActive('sn_gfa'))
        goalRelationshipGr.addQuery('target', targetId);
    goalRelationshipGr.addQuery('entity_id', itemId);
    goalRelationshipGr.addQuery('is_primary_goal', isPrimaryGoal);
    goalRelationshipGr.query();
    return goalRelationshipGr.hasNext();
};

GFGoalRelationshipSNC.populateWorkItemOfExistingGoalRelationships = function(populatedWorkItemType, populatedWorkItemId, workItemTypeToBePopulated, workItemIdToBePopulated) {
    var populatedWorkItemField = (populatedWorkItemType in GFGoalRelationshipSNC.tableToFieldMapping) ? GFGoalRelationshipSNC.tableToFieldMapping[populatedWorkItemType] : 'planning_item_id';
    var workItemFieldToBePopulated = (workItemTypeToBePopulated in GFGoalRelationshipSNC.tableToFieldMapping) ? GFGoalRelationshipSNC.tableToFieldMapping[workItemTypeToBePopulated] : 'planning_item_id';
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    if (!goalRelationshipGr.isValidField(populatedWorkItemField) || !goalRelationshipGr.isValidField(workItemFieldToBePopulated)) return;
    goalRelationshipGr.addQuery(populatedWorkItemField, populatedWorkItemId);
    goalRelationshipGr.query();
    goalRelationshipGr.setValue(workItemFieldToBePopulated, workItemIdToBePopulated);
    goalRelationshipGr.updateMultiple();
    return;
};

GFGoalRelationshipSNC.createGoalRelationshipWithEntity = function(goalId, targetId, tableName, entityId, isPrimaryGoal) {
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    goalRelationshipGr.initialize();
    goalRelationshipGr.setValue('goal', goalId);
    if (GlidePluginManager.isActive('sn_gfa'))
        goalRelationshipGr.setValue('target', targetId);
    goalRelationshipGr.setValue('table_name', tableName);
    goalRelationshipGr.setValue('entity_id', entityId);
    goalRelationshipGr.setValue('is_primary_goal', isPrimaryGoal);
    return goalRelationshipGr.insert();
};

GFGoalRelationshipSNC.createGoalRelationshipWithWorkItemField = function(goalId, targetId, workItemField, workItemId, isPrimaryGoal) {
    var goalRelationshipGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    goalRelationshipGr.initialize();
    goalRelationshipGr.setValue('goal', goalId);
    if (GlidePluginManager.isActive('sn_gfa'))
        goalRelationshipGr.setValue('target', targetId);
    goalRelationshipGr.setValue(workItemField, workItemId);
    goalRelationshipGr.setValue('is_primary_goal', isPrimaryGoal);
    var insertedId = goalRelationshipGr.insert();
    return {
        insertedGr: goalRelationshipGr,
        insertedId: insertedId
    };
};

GFGoalRelationshipSNC.updateOrDeletePlanningItemGoalRelationships = function(planningItemId, planningItemTable) {
    var goalRelGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    if (!goalRelGr.isValid() || !GlidePluginManager.isActive('sn_align_ws') || !goalRelGr.isValidField('planning_item_id'))
        return;

    var goalsDataBrokerHelper = new sn_align_ws.GoalsDataBrokerHelper();
    if (!gs.nil(planningItemTable) && goalsDataBrokerHelper && goalsDataBrokerHelper.getValidPlanningItemTables && goalsDataBrokerHelper.getValidPlanningItemTables().indexOf(planningItemTable) == -1) {
        sn_gf.GFGoalRelationshipSNC.deleteWorkItemGoalRelationships(planningItemId);
        return;
    }

    goalRelGr.addQuery('planning_item_id', planningItemId);
    goalRelGr.orderBy('is_primary_goal');
    goalRelGr.query();
    while (goalRelGr.next()) {
        var documentId = goalRelGr.getValue('entity_id');
        if (planningItemId == documentId) { // when there is no integration between work items and planning items, delete goal relationships
            goalRelGr.deleteRecord();
        } else { // when there is integration between work items and planning items, make planning item empty on the goal relationships because the work item goal relationships must still exist
            goalRelGr.setValue('planning_item_id', '');
            goalRelGr.setValue('planning_item_type', '');
            goalRelGr.update();
        }
    }
};
GFGoalRelationshipSNC.deleteWorkItemGoalRelationships = function(workItemId) {
    var goalRelGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    if (!goalRelGr.isValid() || !goalRelGr.isValidField('entity_id'))
        return;

    goalRelGr.addQuery('entity_id', workItemId);
    goalRelGr.orderBy('is_primary_goal');
    goalRelGr.deleteMultiple();
};
GFGoalRelationshipSNC.deleteMultipleGoalRelationships = function(goalRelationshipIds) {
    if (global.JSUtil.nil(goalRelationshipIds) || goalRelationshipIds.length == 0)
        return;

    var undeletedPlanningItemRelationships = [];
    for (var i = 0; i < goalRelationshipIds.length; i++) {
        var goalRelGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        if (goalRelGr.get(goalRelationshipIds[i])) {
            if (goalRelGr.getValue("is_primary_goal") === "0" || sn_gf.GFGoalRelationshipSNC.isDeletionOfPrimaryGoalAllowed(goalRelGr))
                goalRelGr.deleteRecord();
            else
                undeletedPlanningItemRelationships.push(goalRelGr.getDisplayValue("planning_item_id"));
        }
    }
    return undeletedPlanningItemRelationships;
};
