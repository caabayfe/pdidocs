var NLUWorkbenchGlobalScript = Class.create();

(function() {

    var tables = NLUConstants.tables;

    NLUWorkbenchGlobalScript.createTransformMapScript = function(mapSysId, when, script, scope) {
        var mapScriptGr = new GlideRecord(tables.SYS_TRANSFORM_SCRIPT);
        mapScriptGr.initialize();
        mapScriptGr.setValue('map', mapSysId);
        mapScriptGr.setValue('when', when);
        mapScriptGr.setValue('script', script);
        mapScriptGr.setValue('active', true);
        if (scope) mapScriptGr.setValue('sys_scope', NLUSystemUtil.getScope(scope) || 'global');
        return mapScriptGr.insert();
    };

    NLUWorkbenchGlobalScript.scheduleScript = function(script, tableName, recordSysId, label) {
        var so = new global.ScheduleOnce();
        so.script = script;
        so.document = tableName;
        so.document_key = recordSysId;
        so.label = label || recordSysId;
        return so.schedule();
    };

    NLUWorkbenchGlobalScript.cancelSchedule = function(tableName, recordSysId, label) {
        var so = new global.ScheduleOnce();
        so.document = tableName;
        so.document_key = recordSysId;
        so.label = label || recordSysId;
        so.cancel();
    };

    NLUWorkbenchGlobalScript.getDateFormat = function() {
        return gs.getSession().getDateFormat();
    };

    NLUWorkbenchGlobalScript.getDateTimeFormat = function() {
        return gs.getSession().getDateTimeFormat();
    };

    NLUWorkbenchGlobalScript.prototype = {
        initialize: function() {},
        type: 'NLUWorkbenchGlobalScript'
    };
})();
