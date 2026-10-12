var GFDataMigrationUtil = Class.create();
GFDataMigrationUtil.prototype = {
    initialize: function() {},

    migrateGoalsAndStrategiesData: function(jobParamJson) {
        gs.info('==> migrateGoalsAndStrategiesData');
        if (!jobParamJson)
            return;
        if (jobParamJson['migrateGoalData'])
            this.migrateGoalData();
        if (jobParamJson['migrateStrategyData'])
            this.migrateStrategyData();
        if (jobParamJson['migratingGoalStrategyM2Mdata'])
            this.migratingGoalStrategyM2Mdata();
        if (jobParamJson['migrateStrategyWorkItemRelData'])
            this.migrateStrategyWorkItemRelData();
        gs.info('<== migrateGoalsAndStrategiesData');
    },

    migrateGoalData: function() {
        gs.info('==> migrateGoalData');
        var goalMapping = {
            'directMapping': {
                'active': 'active',
                'description': 'comments',
                'owner': 'goal_owner',
                'portfolio': 'portfolio',
                'name': 'short_description',
                'state': 'state',
                'status': 'status_indicator',
                'category': 'goal_indicator',
                'sys_updated_by': 'sys_updated_by',
                'sys_updated_on': 'sys_updated_on',
                'sys_created_by': 'sys_created_by',
                'sys_created_on': 'sys_created_on'
            }
        };

        var entityMapping = {
            'referringFromGoal': {
                'investment': 'invst_investment',
                'task': 'task'
            },
            'referringToGoal': ['pm_project', 'dmn_demand', 'pm_program']
        };

        var targetMapping = {
            'directMapping': {
                'active': 'active',
                'actual_value': 'actual_achievement_till_date',
                'description': 'comments',
                'owner': 'goal_owner',
                'name': 'short_description',
                'state': 'state',
                'status': 'status_indicator',
                'sys_updated_by': 'sys_updated_by',
                'sys_updated_on': 'sys_updated_on',
                'sys_created_by': 'sys_created_by',
                'sys_created_on': 'sys_created_on'
            },
            'choiceMapping': {
                'type': {
                    'fieldMap': 'direction',
                    'valueMap': {
                        'increase': 'maximize',
                        'decrease': 'minimize'
                    }
                }
            },
            'referenceMapping': {
                'measure': {
                    'fieldMap': 'unit',
                    'valueMap': {
                        '#': '7e38adc453213010c8d4ddeeff7b1266',
                        '$': '5258210853213010c8d4ddeeff7b12a1',
                        '%': 'ebc769c453213010c8d4ddeeff7b12dc',
                        'Days': 'c888610853213010c8d4ddeeff7b128b',
                        'Percentage': 'ebc769c453213010c8d4ddeeff7b12dc',
                        'Percent': 'ebc769c453213010c8d4ddeeff7b12dc'
                    }
                }
            },
            'precedenceFields': {
                'target_value': ['target_value', 'estimated_achievement'],
            }
        };
        var oldGoalGR = new GlideRecord('goal');
        oldGoalGR.addNotNullQuery('direction');
        if (!oldGoalGR.isValid())
            return;
        oldGoalGR.query();
        while (oldGoalGR.next()) {
            if (this._recordAlreadyExists(GoalFrameworkConstants.GOAL_TABLE, oldGoalGR.getUniqueValue())) {
                gs.info('<==> migrateGoalData: Skipping migration of record with ID ' + oldGoalGR.getUniqueValue() + ' .Record already exists in new Goal table.');
                continue;
            }
            var newGoalGr = this.mapFieldsFromOldTONewTable(GoalFrameworkConstants.GOAL_TABLE, goalMapping, oldGoalGR);
            newGoalGr.setNewGuidValue(oldGoalGR.getUniqueValue());
            this._setDatesBasedOnProperty(newGoalGr, oldGoalGR);
            newGoalGr.autoSysFields(false);
            newGoalGr.setWorkflow(false);
            var newGoalSysId = newGoalGr.insert();
            if (newGoalSysId) {
                gs.info('<==> migrateGoalData: Successfully migrated ' + oldGoalGR.getUniqueValue() + ' to new goal table with sysId ' + newGoalSysId);
                this._addGoalEntityInm2mTable(newGoalSysId, oldGoalGR, entityMapping);
                var newTargerGr = this.mapFieldsFromOldTONewTable(GoalFrameworkConstants.GOAL_TARGET_TABLE, targetMapping, oldGoalGR);
                newTargerGr.setValue('goal', newGoalSysId);
                this._setDatesBasedOnProperty(newTargerGr, oldGoalGR);
                newTargerGr.autoSysFields(false);
                newTargerGr.setWorkflow(false);
                var newTargetSysId = newTargerGr.insert();
                if (newTargetSysId)
                    gs.info('<==> migrateGoalData: Successfully migrated ' + oldGoalGR.getUniqueValue() + ' to new target table with sysId ' + newGoalSysId);
                else {
                    gs.info('<==> migrateGoalData: Migrating ' + oldGoalGR.getUniqueValue() + ' to new target table failed');
                }
            } else
                gs.info('<==> migrateGoalData: Migrating ' + oldGoalGR.getUniqueValue() + ' to new goal table failed');
        }
        gs.info('<== migrateGoalData');
    },

    migrateStrategyData: function() {
        gs.info('==> migrateStrategyData');
        var strategyMapping = {
            'directMapping': {
                'active': 'active',
                'owner': 'assigned_to',
                'description': 'description',
                'start_date': 'from_fiscal',
                'name': 'title',
                'end_date': 'to_fiscal',
                'business_unit': 'business_unit',
                'type': 'type',
                'parent': 'enterprise_strategy',
                'sys_updated_by': 'sys_updated_by',
                'sys_updated_on': 'sys_updated_on',
                'sys_created_by': 'sys_created_by',
                'sys_created_on': 'sys_created_on'
            }
        };

        var entityMapping = {
            'referringToStrategy': ['pm_project', 'dmn_demand', 'pm_program']
        };
        var strategyTables = ['business_unit_strategy', 'strategic_objective'];

        for (var index = 0; index < strategyTables.length; index++) {
            gs.info('<==> migrateStrategyData: Migrating data from' + strategyTables[index] + ' table');
            var oldStrategyGR = new GlideRecord(strategyTables[index]);
            if (!oldStrategyGR.isValid())
                return;
            oldStrategyGR.query();
            while (oldStrategyGR.next()) {
                if (this._recordAlreadyExists(GoalFrameworkConstants.STRATEGY_TABLE, oldStrategyGR.getUniqueValue())) {
                    gs.info('<==> migrateStrategyData: Skipping migration of record with ID ' + oldStrategyGR.getUniqueValue() + ' .Record already exists in new Strategy table.');
                    continue;
                }
                var newStrategyGr = this.mapFieldsFromOldTONewTable(GoalFrameworkConstants.STRATEGY_TABLE, strategyMapping, oldStrategyGR);
                newStrategyGr.setNewGuidValue(oldStrategyGR.getUniqueValue());
                newStrategyGr.autoSysFields(false);
                newStrategyGr.setWorkflow(false);
                var newStrategySysId = newStrategyGr.insert();
                if (newStrategySysId) {
                    gs.info('<==> migrateStrategyData: Successfully migrated ' + oldStrategyGR.getUniqueValue() + ' to new Strategy table with sysId ' + newStrategySysId);
                } else
                    gs.info('<==> migrateStrategyData: Migrating ' + oldStrategyGR.getUniqueValue() + ' to new Strategy table failed');
            }
        }
        gs.info('<== migrateStrategyData');
    },

    migrateStrategyWorkItemRelData: function() {
        gs.info('==> migrateStrategyWorkItemRelData');
        var workItemTables = ['pm_project', 'dmn_demand', 'pm_program'];
        var strategyGr = new GlideRecord(GoalFrameworkConstants.STRATEGY_TABLE);
        if (strategyGr.isValid()) {
            strategyGr.query();
            while (strategyGr.next()) {
                var strategySysId = strategyGr.getUniqueValue();
                for (var index = 0; index < workItemTables.length; index++) {
                    gs.info('<==> migrateStrategyWorkItemRelData: Migrating ' + workItemTables[index] + ' workItem for strategy with sysId ' + strategySysId);
                    var workItemGr = this._getWorkItemRecordsAssociatedToStrategy(workItemTables[index], strategySysId);
                    while (workItemGr && workItemGr.next()) {
                        if (!this._strategyWorkItemMappingExists(strategySysId, workItemGr.getUniqueValue())) {
                            var dummyGoalSysId = this._getDummyGoalSysIdForStrategy(strategyGr);
                            gs.info('<==> migrateStrategyWorkItemRelData: Establishing strategy workItem relationship by dummy goal with sysId ' + dummyGoalSysId);
                            this._addEntityInm2mTableUtil(workItemTables[index], dummyGoalSysId, workItemGr.getUniqueValue(), false, !this._doesGoalExistsForWorkItem(workItemGr.getUniqueValue()));
                        } else {
                            gs.info('==> migrateStrategyWorkItemRelData: Strategy workItem relationship already exists for ' + workItemTables[index] + ' with sysId ' + workItemGr.getUniqueValue());
                        }
                    }

                }
            }

        }

        gs.info('<== migrateStrategyWorkItemRelData');
    },

    _getDummyGoalSysIdForStrategy: function(strategyGr) {
        gs.info('==> _getDummyGoalSysIdForStrategy');
        var m2mGoalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        if (m2mGoalRelationshipGr.isValid()) {
            m2mGoalRelationshipGr.addQuery('goal.strategy', strategyGr.getUniqueValue());
            m2mGoalRelationshipGr.addQuery('goal.name', 'Goal:' + strategyGr.getValue('name'));
            m2mGoalRelationshipGr.query();
            if (m2mGoalRelationshipGr.next())
                return m2mGoalRelationshipGr.getValue('goal');

        }
        var goalStrategyMapping = {
            'active': 'active',
            'business_unit': 'business_unit',
            'calendar_period': 'calendar_period',
            'company': 'company',
            'department': 'department',
            'description': 'description',
            'end_date': 'end_date',
            'owner': 'owner',
            'start_date': 'start_date'
        };
        var dummyGoalGr = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
        dummyGoalGr.initialize();
        for (var prop in goalStrategyMapping) {
            if (dummyGoalGr.isValidField(prop))
                dummyGoalGr.setValue(prop, strategyGr.getValue(goalStrategyMapping[prop]));
        }
        if (dummyGoalGr.isValidField('name'))
            dummyGoalGr.setValue('name', 'Goal:' + strategyGr.getValue('name'));
        if (dummyGoalGr.isValidField('strategy'))
            dummyGoalGr.setValue('strategy', strategyGr.getUniqueValue());
        dummyGoalGr.setWorkflow(false);
        return dummyGoalGr.insert();
    },



    _getWorkItemRecordsAssociatedToStrategy: function(workItemTableName, strategySysId) {
        var workItemTableGr = new GlideRecord(workItemTableName);
        if (workItemTableGr.isValid()) {
            workItemTableGr.addQuery('strategic_objectives', 'CONTAINS', strategySysId);
            workItemTableGr.query();
            return workItemTableGr;
        }
        return null;
    },

    _strategyWorkItemMappingExists: function(strategySysId, workItemSysId) {
        var m2mGoalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        if (m2mGoalRelationshipGr.isValid()) {
            m2mGoalRelationshipGr.addQuery('goal.strategy', strategySysId);
            m2mGoalRelationshipGr.addQuery('entity_id', workItemSysId);
            m2mGoalRelationshipGr.setLimit(1);
            m2mGoalRelationshipGr.query();
            return m2mGoalRelationshipGr.hasNext();
        }
        return true;
    },

    _recordAlreadyExists: function(tableName, sysId) {
        var tableGr = new GlideRecord(tableName);
        return tableGr.get(sysId);
    },

    _setDatesBasedOnProperty: function(glideRecord, oldGoalGR) {
        var goal_calendar_type = gs.getProperty('sn_gf.goal_calendar_type');
        if (oldGoalGR.isValidField('target_fiscal_year') && oldGoalGR.getValue('target_fiscal_year')) {
            var startDate = new GlideDateTime(oldGoalGR.target_fiscal_year.fiscal_start_date_time).getDate();
            var endDate = new GlideDateTime(oldGoalGR.target_fiscal_year.fiscal_end_date_time).getDate();
            glideRecord.setValue('start_date', startDate);
            glideRecord.setValue('end_date', endDate);
            if (goal_calendar_type == 'fiscal_period' && glideRecord.isValidField('calendar_period')) {
                glideRecord.setValue('calendar_period', oldGoalGR.getValue('target_fiscal_year'));
            }
        }
    },

    _addGoalEntityInm2mTable: function(goalSysId, oldGoalGR, entityMapping) {
        gs.info('==> _addGoalEntityInm2mTable with goalSysId: ' + goalSysId + ' oldGoalGRs sysId: ' + oldGoalGR.getUniqueValue() + ' entityMapping: ' + JSON.stringify(entityMapping));
        var referringFromGoal = entityMapping['referringFromGoal'];
        for (var key in referringFromGoal) {
            if (oldGoalGR.getValue(key)) {
                var resolvedEntity = this._resolveClassName(referringFromGoal[key], oldGoalGR.getValue(key));
                this._addEntityInm2mTableUtil(resolvedEntity['tableName'], goalSysId, oldGoalGR.getValue(key), resolvedEntity['shouldConsiderDocumentId'], false);
            }
        }

        var referringToGoal = entityMapping['referringToGoal'];
        for (var index = 0; index < referringToGoal.length; index++) {
            var itbmTableGr = new GlideRecord(referringToGoal[index]);
            if (!itbmTableGr.isValid())
                return;
            itbmTableGr.addQuery('goals', 'CONTAINS', oldGoalGR.getUniqueValue());
            itbmTableGr.query();
            while (itbmTableGr.next()) {
                if (this._isPrimaryGoal(itbmTableGr, goalSysId)) {
                    this._addEntityInm2mTableUtil(referringToGoal[index], goalSysId, itbmTableGr.getUniqueValue(), false, true);
                } else
                    this._addEntityInm2mTableUtil(referringToGoal[index], goalSysId, itbmTableGr.getUniqueValue(), false, false);
            }
        }
        gs.info('<== _addGoalEntityInm2mTable');
    },

    _doesGoalExistsForWorkItem: function(workItemSysId) {
        gs.info('==> _doesGoalExistsForWorkItem with workItemSysId: ' + workItemSysId);
        var m2mGoalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        m2mGoalRelationshipGr.addQuery('entity_id', workItemSysId);
        m2mGoalRelationshipGr.setLimit(1);
        m2mGoalRelationshipGr.query();
        return m2mGoalRelationshipGr.hasNext();
    },

    _isPrimaryGoal: function(itbmTableGr, goalSysId) {
        var isPrimaryGoal = false;
        gs.info('==> _isPrimaryGoal with itbmTableGr: ' + itbmTableGr.getUniqueValue() + ' goalSysId: ' + goalSysId);
        var goalList = itbmTableGr.getValue('goals').split(',');
        if (goalList[0] == goalSysId)
            isPrimaryGoal = true;
        gs.info('<== _isPrimaryGoal with isPrimaryGoal: ' + isPrimaryGoal);
        return isPrimaryGoal;
    },

    _resolveClassName: function(tableName, itbmRecordSysId) {
        gs.info('==> _resolveClassName with tableName: ' + tableName + ' itbmRecordSysId: ' + itbmRecordSysId);
        var resolvedEntity = {};

        if (tableName == 'invst_investment') {
            resolvedEntity['tableName'] = tableName;
            resolvedEntity['shouldConsiderDocumentId'] = true;
        } else if (tableName == 'task') {
            var taskGr = new GlideRecord('task');
            if (!taskGr.isValid())
                return;
            if (taskGr.get(itbmRecordSysId)) {
                var className = taskGr.getValue('sys_class_name');

                if (className === 'pm_project' || className === 'dmn_demand' || className === 'pm_program') {
                    resolvedEntity['tableName'] = className;
                    resolvedEntity['shouldConsiderDocumentId'] = false;
                } else {
                    resolvedEntity['tableName'] = className;
                    resolvedEntity['shouldConsiderDocumentId'] = true;
                }
            }
        }

        gs.info('<== _resolveClassName with resolvedEntity: ' + JSON.stringify(resolvedEntity));

        return resolvedEntity;
    },

    _addEntityInm2mTableUtil: function(tableName, goalSysId, itbmRecordSysId, shouldConsiderDocumentId, isPrimary) {
        gs.info('==> _addEntityInm2mTableUtil with tableName: ' + tableName + ' goalSysId: ' + goalSysId + ' itbmRecordSysId: ' + itbmRecordSysId + ' shouldConsiderDocumentId: ' + shouldConsiderDocumentId + ' isPrimary: ' + isPrimary);
        var m2mGoalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
        if (!m2mGoalRelationshipGr.isValid())
            return;
        m2mGoalRelationshipGr.initialize();
        m2mGoalRelationshipGr.setValue('goal', goalSysId);
        if (shouldConsiderDocumentId) {
            m2mGoalRelationshipGr.setValue('table_name', tableName);
            m2mGoalRelationshipGr.setValue('entity_id', itbmRecordSysId);
        } else {
            m2mGoalRelationshipGr.setValue(tableName.split('_')[1], itbmRecordSysId);

        }
        m2mGoalRelationshipGr.setValue('is_primary_goal', isPrimary);
        var m2mGoalRelationshipSysId = m2mGoalRelationshipGr.insert();
        if (m2mGoalRelationshipSysId)
            gs.info('<==> _addEntityInm2mTableUtil: Successfully added record in  sn_gf_goal_m2m_relationship table with  sysId' + m2mGoalRelationshipSysId + ' for tableName: ' + tableName + ' goalSysId: ' + goalSysId + ' itbmRecordSysId: ' + itbmRecordSysId + ' shouldConsiderDocumentId: ' + shouldConsiderDocumentId + ' isPrimary: ' + isPrimary);
        else
            gs.info('<==> _addEntityInm2mTableUtil: Failed adding record in  sn_gf_goal_m2m_relationship table for tableName: ' + tableName + ' goalSysId: ' + goalSysId + ' itbmRecordSysId: ' + itbmRecordSysId + ' shouldConsiderDocumentId: ' + shouldConsiderDocumentId + ' isPrimary: ' + isPrimary);
        gs.info('<== _addEntityInm2mTableUtil');
    },

    mapFieldsFromOldTONewTable: function(tableName, columnMap, tableGr) {
        gs.info('==> mapFieldsFromOldTONewTable with tableName: ' + tableName + ' columnMap: ' + JSON.stringify(columnMap) + ' tableGr with sysId: ' + tableGr.getUniqueValue());
        var newTableGr = new GlideRecord(tableName);
        if (!newTableGr.isValid())
            return;
        newTableGr.initialize();
        for (var mapType in columnMap) {
            var fieldMapJson = columnMap[mapType];
            for (var key in fieldMapJson) {
                if (newTableGr.isValidField(key)) {
                    newTableGr.setValue(key, this._getValueFromOldTable(fieldMapJson, mapType, key, tableGr));
                }
            }
        }
        gs.info('<== mapFieldsFromOldTONewTable');
        return newTableGr;
    },

    _getValueFromOldTable: function(fieldMapJson, mapType, key, oldTableGr) {
        gs.info('==> _getValueFromOldTable with fieldMapJson: ' + JSON.stringify(fieldMapJson) + ' mapType: ' + mapType + ' key: ' + key + ' oldTableGr with sysId: ' + oldTableGr.getUniqueValue());
        var returnValue;
        switch (mapType) {
            case 'directMapping':
                returnValue = oldTableGr.getValue(fieldMapJson[key]);
                break;
            case 'choiceMapping':
                returnValue = fieldMapJson[key]['valueMap'][oldTableGr.getValue(fieldMapJson[key]['fieldMap'])];
                break;
            case 'precedenceFields':
                returnValue = this._getPrecedenceValue(fieldMapJson[key], oldTableGr);
                break;
            case 'referenceMapping':
                returnValue = fieldMapJson[key]['valueMap'][oldTableGr.getDisplayValue(fieldMapJson[key]['fieldMap'])];
                break;
            default:
                return '';

        }
        return returnValue ? returnValue : '';
    },

    _getPrecedenceValue: function(precedenceArray, glideRecord) {
        gs.info('==> _getPrecedenceValue with precedenceArray: ' + precedenceArray.toString() + ' glideRecord with sysId: ' + glideRecord.getUniqueValue());
        var precedenceValue;
        for (var index = 0; index < precedenceArray.length; index++) {
            if (glideRecord.getValue(precedenceArray[index])) {
                return glideRecord.getValue(precedenceArray[index]);
            }
        }
        return '';
    },

    migratingGoalStrategyM2Mdata: function() {
        gs.info('==> migratingGoalStrategyM2Mdata');
        var goalGr = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
        goalGr.query();
        while (goalGr.next()) {
            if (global.JSUtil.notNil(goalGr.getValue('strategy')))
                continue;
            var strategies = this._getStrategiesList(goalGr.getUniqueValue());
            this._cloneAndCreateStrategyReferenceInGoal(strategies, goalGr.getUniqueValue());
        }
        gs.info('<== migratingGoalStrategyM2Mdata');
    },

    _getStrategiesList: function(goalSysId) {
        gs.info('==> _getStrategiesList: with goalSysId ' + goalSysId);
        var strategies = [];
        var goalStrategyM2MTables = ['m2m_enterprise_s_goals', 'm2m_bu_s_goals'];
        for (var index = 0; index < goalStrategyM2MTables.length; index++) {
            var strategyColumnName = goalStrategyM2MTables[index] == 'm2m_enterprise_s_goals' ? 'enterprise_strategy' : 'business_unit_strategy';
            var goalStrategyM2MGr = new GlideRecord(goalStrategyM2MTables[index]);
            goalStrategyM2MGr.addQuery('goal', goalSysId);
            goalStrategyM2MGr.query();
            while (goalStrategyM2MGr.next()) {
                strategies.push(String(goalStrategyM2MGr.getValue(strategyColumnName)));
            }
        }
        gs.info('<== _getStrategiesList with srategies ' + strategies);
        return strategies;
    },

    _cloneAndCreateStrategyReferenceInGoal: function(strategies, goalSysId) {
        gs.info('==> _cloneAndCreateStrategyReferenceInGoal with strategies ' + strategies + ' and goalSysId ' + goalSysId);
        if (!strategies || strategies.length == 0)
            return;
        var goalGr = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
        if (goalGr.get(goalSysId)) {
            for (var index = 1; index < strategies.length; index++) {
                if (this._recordAlreadyExists(GoalFrameworkConstants.STRATEGY_TABLE, strategies[index]))
                    this._createGoalClone(strategies[index], goalGr);
            }
            if (this._recordAlreadyExists(GoalFrameworkConstants.STRATEGY_TABLE, strategies[0])) {
                goalGr.setValue('strategy', strategies[0]);
                goalGr.setWorkflow(false);
                goalGr.update();
            }
        }
        gs.info('<== _cloneAndCreateStrategyReferenceInGoal');
    },

    _createGoalClone: function(strategySysId, goalGr) {
        gs.info('==> _createGoalClone with strategySysId ' + strategySysId);
        var cloneGoalGr = new GlideRecord(GoalFrameworkConstants.GOAL_TABLE);
        cloneGoalGr.initialize();
        for (var prop in goalGr) {
            cloneGoalGr.setValue(prop, goalGr.getValue(prop));
        }
        cloneGoalGr.setValue('name', 'Cloned SubGoal: ' + goalGr.getValue('name'));
        cloneGoalGr.setValue('parent_goal', goalGr.getUniqueValue());
        cloneGoalGr.setValue('strategy', strategySysId);
        cloneGoalGr.setWorkflow(false);
        cloneGoalGr.insert();
        gs.info('<== _createGoalClone');
    },
    type: 'GFDataMigrationUtil'
};
