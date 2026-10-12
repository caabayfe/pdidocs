var GFGoalMtoM_Migration = Class.create();
GFGoalMtoM_Migration.prototype = {
    initialize: function() {
        this.ids = [];
		this.assignedEntityTables= [];
		this.assignedEntityFields= [];
    },
    process: function(entity) {
        try {
            gs.info("GFGoalMtoM_Migration: ==> Migration of data from goals M2M table to goal table started");
            var goalGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
            if (!goalGR.isValidField("assigned_entity")) {
                gs.info("GFGoalMtoM_Migration: Goals M2M to goal table migration stopped due to assigned_entity field not present in goal table");
                return;
            }
			this._getEntities();
            var entities = entity ? entity : this.assignedEntityTables;
            var m2mObj = this._getRelationships(entities);
            this._migrateData(m2mObj);
            this._deleteRelationshipRecords(Object.keys(this.ids), m2mObj);
            gs.info("GFGoalMtoM_Migration: <== Migration of data from goals M2M table to goal table finished");
        } catch (err) {
            gs.info('Error while Migration of data from goals M2M table to goal table: ' + err);
        }
    },
    _getEntities: function() {
        var entityGR = new GlideRecord(GoalFrameworkConstants.GOAL_ASSIGNED_ENTITY_CONFIG_TABLE);
        if (!entityGR.isValid())
            return;
        entityGR.query();
        while (entityGR.next()) {
            this.assignedEntityTables.push(entityGR.getValue("assigned_entity_table"));
			this.assignedEntityFields[entityGR.getValue("assigned_entity_field")] = true;	
        }
    },
    _getRelationships: function(entities) {
        gs.info("GFGoalMtoM_Migration: ==> Goal relationships fetching started.");
        var m2mObj = {};
        var m2mGR = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        m2mGR.addQuery("table_name", "IN", entities);
        m2mGR.orderBy('goal');
        m2mGR.query();
        try {
            while (m2mGR.next()) {
                var goal = m2mGR.getValue('goal');
                if (!m2mObj[goal])
                    m2mObj[goal] = [];

                m2mObj[goal].push({
                    "entity_id": m2mGR.getValue('entity_id'),
                    "sys_id": m2mGR.getValue('sys_id'),
                    "table_name": m2mGR.getValue('table_name'),
                    "goal_name": m2mGR.getDisplayValue('goal'),
                    "is_primary_goal": m2mGR.getValue('is_primary_goal'),
                    "is_assigned_entity": m2mGR.getElement('goal.assigned_entity') ? m2mGR.getElement('goal.assigned_entity').toString() : ""
                });
            }
            gs.info("GFGoalMtoM_Migration: <== Goal relationships fetched successfully.");
        } catch (err) {
            gs.info('Error while fetching goal relationships:' + err);
        }
        return m2mObj;
    },
    _migrateData: function(m2mObj) {
        gs.info("GFGoalMtoM_Migration: ==> Goal relationships data migration started.");
        for (const goal in m2mObj) {
            if (m2mObj[goal].length == 1 && !m2mObj[goal][0].is_assigned_entity) {
                this._migrateDataWithOneRelationship(goal, m2mObj[goal][0]);
            } else {
                this._migrateDataWithMultipleRelationships(goal, m2mObj[goal]);
            }
        }
        gs.info("GFGoalMtoM_Migration: <== Goal relationships data migration finished.");
    },
    _migrateDataWithOneRelationship(goal, val) {
        try {
            var goalGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
            goalGR.get(goal);
            goalGR.setValue('assigned_entity_type', val.table_name);
            goalGR.setValue('assigned_entity', val.entity_id);
            if (goalGR.update()) {
                gs.info("GFGoalMtoM_Migration: Data migrated successfully for Goal Id: " + goal);
                this.ids[val.sys_id] = {
                    "goal_id": goal,
                    "type": "update"
                };
            } else {
                gs.info("GFGoalMtoM_Migration: Data migration failed for Goal Id: " + goal);
            }
        } catch (err) {
            gs.info('Error while data migration for Goal Id: : ' + goal + " " + err);
        }
    },
    _migrateDataWithMultipleRelationships(goal, val) {
        try {

            var oldGoalGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
            oldGoalGR.get(goal);
            for (var k = 0; k < val.length; k++) {
                var subGoalGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
                subGoalGR.initialize();
                for (var prop in oldGoalGR) {
                    if ( !this.assignedEntityFields[prop]){
						subGoalGR.setValue(prop, oldGoalGR.getValue(prop));
					}
                }
                subGoalGR.setValue('name', 'Clone Sub Goal ' + parseInt(k + 1) + " of " + val[k].goal_name);
                subGoalGR.setValue('parent_goal', goal);
                subGoalGR.setValue('assigned_entity_type', val[k].table_name);
                subGoalGR.setValue('assigned_entity', val[k].entity_id);
                var newGoalId = subGoalGR.insert();
                if (newGoalId) {
                    gs.info("GFGoalMtoM_Migration: Data migrated successfully for Goal Id: " + goal);
                    this.ids[val[k].sys_id] = {
                        "goal_id": newGoalId,
                        "type": "insert"
                    };
                } else {
                    gs.info("GFGoalMtoM_Migration: Data migration failed for Goal Id: " + goal);
                }
            }
        } catch (err) {
            gs.info('Error while data migration for Goal Id:' + goal + " " + err);
        }
    },
    _deleteRelationshipRecords(relIds) {
        try {
            var relGR = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
            relGR.addQuery('sys_id', "IN", relIds);
            relGR.orderBy('is_primary_goal');
            relGR.query();
            while (relGR.next()) {
                var id = relGR.getUniqueValue();
                if (relGR.deleteRecord()) {
                    gs.info("GFGoalMtoM_Migration: Record deleted Successfully for Relationship Id : " + id);
                } else {
                    gs.info("GFGoalMtoM_Migration: Record deleted failed, Rolling back the changes for Relationship Id : " + id);
                    this._rollBackChanges(id);
                }
            }
        } catch (err) {
            gs.info('Error while data migration of goal relationships for Goal Id: ' + goal + " " + err);
        }
    },
    _rollBackChanges(id) {
        var rel = this.ids[id];
        if (rel.type === 'update') {
            var goalUpdateGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
            goalUpdateGR.get(rel.goal_id);
            goalUpdateGR.setValue("assigned_entity_type", "");
            goalUpdateGR.setValue("assigned_entity", "");
            if (goalUpdateGR.update())
                gs.info("GFGoalMtoM_Migration: ==> Goal data migration Roll back successful for Goal Id : " + rel.goal_id);
            else
                gs.info("GFGoalMtoM_Migration: ==> Goal data migration Roll back failed for Goal Id : " + rel.goal_id);
        } else {
            var goalInsertGR = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
            goalInsertGR.get(rel.goal_id);
            if (goalInsertGR.deleteRecord())
                gs.info("GFGoalMtoM_Migration: ==> Goal data migration Roll back successful for Goal Id : " + rel.goal_id);
            else
                gs.info("GFGoalMtoM_Migration: ==> Goal data migration Roll back failed for Goal Id : " + rel.goal_id);
        }
    },
    type: 'GFGoalMtoM_Migration'
};
