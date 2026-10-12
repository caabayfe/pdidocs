var GFUtil = Class.create();
GFUtil.prototype = {
    initialize: function() {},
    type: 'GFUtil'
};

GFUtil.checkCircularLoop = function(childId, parentId, tableName, parentField) {
    if (childId == parentId)
        return true;
    if (!parentField)
        parentField = "parent_goal";
    var childEntities = new GlideRecord(tableName);
    childEntities.addQuery(parentField, childId);
    childEntities.query();
    while (childEntities.next()) {
        if (GFUtil.checkCircularLoop(childEntities.getUniqueValue(), parentId, tableName, parentField))
            return true;
    }
    return false;
};

GFUtil.checkDuplicateWorkItem = function(glideRecord) {
    if (!glideRecord.isValid())
        return false;
    var goalRelationshipGr = new GlideRecord(GoalFrameworkConstants.GOAL_RELATIONSHIP_TABLE);
    if (goalRelationshipGr.isValid()) {
        goalRelationshipGr.addQuery('goal', glideRecord.getValue('goal'));
        if (GlidePluginManager.isActive('sn_gfa'))
            goalRelationshipGr.addQuery('target', glideRecord.getValue('target'));
        goalRelationshipGr.addQuery('entity_id', glideRecord.getValue('entity_id'));
        goalRelationshipGr.query();
        if (goalRelationshipGr.hasNext())
            return true;
    }
    return false;

};

GFUtil.getGoalRecordCount = function() {
    var goalGr = new GlideRecord(GoalFrameworkConstants.GOAL_CORE_TABLE);
    if (goalGr.isValid()) {
        goalGr.query();
        return goalGr.getRowCount();
    }
    return 0;
};

GFUtil.getStrategyRecordCount = function() {
    var strategyGr = new GlideRecord(GoalFrameworkConstants.STRATEGY_TABLE);
    if (strategyGr.isValid()) {
        strategyGr.query();
        return strategyGr.getRowCount();
    }
    return 0;
};

GFUtil.isInstanceOfCoreGoal = function(goalTableName) {
    var coreGoalHierarchy = new GlideTableHierarchy(sn_gf.GoalFrameworkConstants.GOAL_CORE_TABLE);
    var coreGoalHierarchyTables = coreGoalHierarchy.getHierarchy();
    return (coreGoalHierarchyTables.indexOf(goalTableName) > -1);
};

GFUtil.isInstanceOf = function(table, parentTable) {
    var glideTableHierarchy = new GlideTableHierarchy(table);
    var tableHierarchy = glideTableHierarchy.getHierarchy();
    return (tableHierarchy.indexOf(parentTable) > -1);
};

GFUtil.deleteRecord = function(tableName, sysId) {
    if (tableName === "goal")
        tableName = "sn_gf_core_goal";
    else if (tableName === "target")
        tableName = "sn_gf_goal_target";
    else
        return false;

    var gr = new GlideRecordSecure(tableName);
    gr.get(sysId);
    var recordDeleted = gr.deleteRecord();
    return recordDeleted;
};

GFUtil.sanitizeFieldValueWithUnit = function(fieldValue) {
	return fieldValue.replace(/[^\d.,-]/g, '');
},

GFUtil.updateRecord = function(tableName, sysId, fields) {
    var gr = new GlideRecordSecure(tableName);
    if (gr.get(sysId)) {
        var field = fields.split(/=(.*)/s); // regex to split based on first occurance of character "=".
        if (field[0] === "actual_value" && !field[1] && tableName === "sn_gf_goal_target") {
            //handle qual. target as well
            if (gr.measure.getRefRecord() && gr.measure.getRefRecord().choice_set) {
                gr.setValue("percent_complete", "");
                field[0] = 'qualitative_' + field[0];
                gr.setValue(field[0], field[1]);
            } else {
                gr.setValue("percent_complete", "");
                gr.setValue(field[0], field[1]);
            }
        } else if (field[0] === "contributors") {
            gr.setValue(field[0], field[1].split(","));
        } else if (field[0] === "baseline_reference") {
            gr.setValue(field[0], GFUtil.sanitizeFieldValueWithUnit(field[1]));
        } else {
            //handle qual. target scenario as well, mostly qual. actual/base/target value
            if (field[0] == 'actual_value' || field[0] == 'base_value' || field[0] == 'target_value') {
                if (gr.measure && gr.measure.getRefRecord() && gr.measure.getRefRecord().choice_set) {
                    field[0] = 'qualitative_' + field[0];
                } else {
                    field[1] = GFUtil.sanitizeFieldValueWithUnit(field[1]);
				}
                gr.setValue(field[0], field[1]);
            } else
                gr.setValue(field[0], field[1]);
        }

        var recordUpdated = gr.update();
        return recordUpdated;
    } else
        return false;
};

GFUtil.updateMultipleRecords = function(tableName, sysIds, fieldMap) {
    var gr = new GlideRecordSecure(tableName);
    if (!gr.isValid())
        return;
    gr.addQuery('sys_id', 'IN', sysIds);
    gr.query();
    var fields = Object.keys(fieldMap);
    for (var i = 0; i < fields.length; i++) {
        if (gr.isValidField(fields[i])) {
            gr.setValue(fields[i], fieldMap[fields[i]]);
        }
    }
    gr.updateMultiple();
};

GFUtil.getTableLabel = function(tableName) {
    var gr = new GlideRecord(tableName);
    return GlideStringUtil.escapeHTML(gr.getClassDisplayValue());
};

GFUtil.getTablePluralLabel = function(tableName) {
    var gr = new GlideRecord(tableName);
    return GlideStringUtil.escapeHTML(gr.getED().getPlural());
};

GFUtil.getTableHierarchy = function(tableName, tableHierarchyObject) {
    tableHierarchyObject[tableName] = true;
    var tableExtensions = new GlideTableHierarchy(tableName).getTableExtensions();
    for (var i = 0; i < tableExtensions.length; i++) {
        GFUtil.getTableHierarchy(tableExtensions[i], tableHierarchyObject);
    }
};

GFUtil.isValidTable = function(table) {
    if (gs.nil(table))
        return false;
    var gr = new GlideRecord(table);
    return gr.isValid();
};

GFUtil.isValidField = function(table, field) {
    if (gs.nil(table) || gs.nil(field))
        return false;
    var gr = new GlideRecord(table);
    return gr.isValid() && gr.isValidField(field);
};

GFUtil.isValidEnterpriseGoalField = function(field, considerCoreGoalFields) {
    var isValidEnterpriseGoalField = GFUtil.isValidField(sn_gf.GoalFrameworkConstants.GOAL_TABLE, field);
    if (!considerCoreGoalFields)
        isValidEnterpriseGoalField = isValidEnterpriseGoalField && !GFUtil.isValidField(sn_gf.GoalFrameworkConstants.GOAL_CORE_TABLE, field);
    return isValidEnterpriseGoalField;
};

GFUtil.getReferencedTable = function(table, field) {
    var dictionaryGr = new GlideRecord("sys_dictionary");
    dictionaryGr.addQuery("name", table);
    dictionaryGr.addQuery("element", field);
    dictionaryGr.query();
    if (dictionaryGr.next())
        return dictionaryGr.getValue("reference");
    return "";
};

GFUtil.getAvgProgress = function(goalIds) {
    let totalProgress = 0,
        goalsCount = goalIds.length;
    if (goalsCount < 1)
        return 0;
    const goalGr = new GlideRecord(sn_gf.GoalFrameworkConstants.GOAL_TABLE);
    goalGr.addQuery("sys_id", "IN", goalIds);
    goalGr.query();
    while (goalGr.next()) {
        const goalProgress = goalGr.getValue('percent_complete');
        totalProgress += gs.nil(goalProgress) ? 0 : parseFloat(goalProgress);
    }
    return Math.round(totalProgress / goalsCount);
};

GFUtil.isGFAdvanceInstalled = function() {
    return GlidePluginManager.isActive('sn_gfa');
};

GFUtil.getDisplayLabel = function() {
    var goalLabel = GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TABLE).toLowerCase();
    var targetLabel = sn_gf.GFUtil.getTableLabel(GoalFrameworkConstants.GOAL_TARGET_TABLE).toLowerCase();
    var displayLabel = goalLabel;
    if (GFUtil.isGFAdvanceInstalled()) {
        displayLabel += '/' + targetLabel;
    }
    return displayLabel;
};

GFUtil.deleteGlideRecord = function(targetProgressGr) {
    if (targetProgressGr)
        targetProgressGr.deleteMultiple();
};


GFUtil.getChoiceListForUnit = function(choiceSetSysId) {
    if (!choiceSetSysId)
        return false;

    var userSelectedLanguage = gs.getSession().getLanguage();
    var choiceSetGr = new GlideRecord('sys_choice_set');
    choiceSetGr.get(choiceSetSysId);
    var element = choiceSetGr.getValue('element');
    var choiceGr = new GlideRecord('sys_choice');
    choiceGr.addQuery('name', 'sn_gf_units');
    choiceGr.addQuery('element', element);
    choiceGr.addQuery('language', userSelectedLanguage);
    choiceGr.orderBy('sequence');
    choiceGr.query();
    var choiceObj = {};
    choiceObj[0] = {
        'label': gs.getMessage('None'),
        'value': ''
    };
    var index = 1;
    while (choiceGr.next()) {
        var msgArray = [];
        var label = choiceGr.getValue('label');
        var value = choiceGr.getValue('value');
        msgArray.push(label);
        msgArray.push(value);
        choiceObj[index] = {
            'label': gs.getMessage('{0}', msgArray),
            'value': gs.getMessage('{1}', msgArray)
        };
        index = index + 1;
    }
    return choiceObj;
};
