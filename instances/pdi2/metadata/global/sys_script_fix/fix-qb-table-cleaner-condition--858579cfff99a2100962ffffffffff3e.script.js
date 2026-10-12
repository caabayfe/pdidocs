if (!pm.isZboot()) {

    gs.info("Fix Script: Started 'Fix QB Table Cleaner Condition' ");

    var qbCleanupScriptSysId = '8fb7decb7753330033b5270bba1061b8';
    var qbCleanupTableCleanerSysId = '73572c36d7202200c1ed0fbc5e610328';

    var scriptIncludeGr = new GlideRecord('sys_script_include');
    scriptIncludeGr.get(qbCleanupScriptSysId);
    if (scriptIncludeGr.isValidRecord() && scriptContainsOOBConditions(scriptIncludeGr)) {
        gs.info("Fix Script: 'Fix QB Table Cleaner Condition' - Instance Contains OOB Script Include");

        var autoFlush = new GlideRecord('sys_auto_flush');
        if (autoFlush.get(qbCleanupTableCleanerSysId)) {
            if (autoFlush.getValue('conditions') == 'sys_idINjavascript: new QBStatusRecordsToDelete().getQueryExecutionIds();^EQ') {
                autoFlush.setValue('conditions', 'sys_idNOT INjavascript: new QBStatusRecordsToDelete().getQueryExecutionIds();^EQ');
                autoFlush.update();
                gs.info("Fix Script: 'Fix QB Table Cleaner Condition' - Updated Table Cleaner Condition");
            }
        }
    }
}

function scriptContainsOOBConditions(scriptIncludeGr) {
    if (!sn_collision.CollisionAPI.willBeReplacedOnUpgrade(scriptIncludeGr)) {
        return scriptIncludeGr.getValue('script').indexOf('glideQbStatus2') == -1;
    }
    return true;
}
