var NLUImportSetUtils = Class.create();

(function() {

    var tables = NLUWorkbenchConstants.tables;

    NLUImportSetUtils.createStageTable = function(label, fields) {
        var st = new sn_impex.GlideImportSetTable(label);
        fields.forEach(function(eachField) {
            st.addStringColumn(eachField.name, eachField.length);
        });
        return st.create();
    };

    NLUImportSetUtils.createTransformMap = function(label, stageTable, targetTable, testSetId, columnsMap) {
        var transformMap = new sn_impex.GlideImportSetTransformMap(label,
            stageTable['tableName'], targetTable);

        var columns = stageTable['columns'];
        columns && Object.keys(columns).forEach(function(columnName) {
            var targetColumnName = columnName.substr(columnName.indexOf("_") + 1);
            if (columnsMap && Object.keys(columnsMap).indexOf(columnName) !== -1) {
                targetColumnName = columnsMap[columnName];
            }
            transformMap.addTransformEntry(columnName, targetColumnName);
        });
        var mapSysId = transformMap.create();
        if (mapSysId) {
            // Enforce mandatory fields:
            var mapGr = new GlideRecord(tables.SYS_TRANSFORM_MAP);
            if (mapGr.get(mapSysId)) {
                mapGr.setValue('enforce_mandatory_fields', 'All Fields');
                mapGr.update();
            }
        }
        return mapSysId;
    };

    NLUImportSetUtils.createTransformMapScripts = function(mapSysId, scripts, appScope) {
        scripts && scripts.forEach(function(eachScript) {
            global.NLUWorkbenchGlobalScript.createTransformMapScript(mapSysId,
                eachScript.event, eachScript.script, appScope);
        });
    };

    NLUImportSetUtils.prototype = {
        initialize: function() {},

        type: 'NLUImportSetUtils'
    };
})();
