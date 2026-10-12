var NLUModelImportUtils = Class.create();

NLUModelImportUtils.createStageTable = function(label, fields) {
    var st = new sn_impex.GlideImportSetTable(label);
    fields.forEach(function(eachField) {
        st.addStringColumn(eachField.name, eachField.length);
    });
    return st.create();
};

NLUModelImportUtils.createTransformMap = function(label, stageTable, targetTable, ignoreColMap) {
    var transformMap = new sn_impex.GlideImportSetTransformMap(label, stageTable['tableName'], targetTable);

    var columns = stageTable['columns'];
    columns && Object.keys(columns).forEach(function(columnName) {
        if (ignoreColMap.indexOf(columnName) === -1) {
            var targetColumnName = columnName.substr(columnName.indexOf("_") + 1);
            transformMap.addTransformEntry(columnName, targetColumnName);
        }
    });
    var mapSysId = transformMap.create();
    if (mapSysId) {
        // Enforce mandatory fields:
        var mapGr = new GlideRecord('sys_transform_map');
        if (mapGr.get(mapSysId)) {
            mapGr.setValue('enforce_mandatory_fields', 'All Fields');
            mapGr.update();
        }
    }
    return mapSysId;
};

NLUModelImportUtils.createTransformMapScripts = function(mapSysId, scripts, appScope) {
    scripts && scripts.forEach(function(eachScript) {
        global.NLUWorkbenchGlobalScript.createTransformMapScript(mapSysId,
            eachScript.event, eachScript.script, appScope);
    });
};

NLUModelImportUtils.prototype = {
    initialize: function() {},
    type: 'NLUModelImportUtils'
};
