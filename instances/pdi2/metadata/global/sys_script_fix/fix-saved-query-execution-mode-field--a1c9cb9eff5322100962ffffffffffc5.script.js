if (!pm.isZboot()) {
    gs.log("Starting fix script for removing duplicate --None-- entries", "QBSavedQueryFix");

    try {
        var choiceGr = new GlideRecord('sys_choice');
        choiceGr.addQuery('name', 'qb_saved_query');
        choiceGr.addQuery('element', 'query_execution_mode');
        choiceGr.addQuery('label', '--None--');
        choiceGr.query();

        if (choiceGr.next()) {
            gs.log("Found system-generated --None-- entry with sys_id: " + choiceGr.sys_id, "QBSavedQueryFix");
            var deleteResult = choiceGr.deleteRecord();
            gs.log("Deleted system-generated entry, result: " + deleteResult, "QBSavedQueryFix");
        } else {
            gs.log("No system-generated --None-- entry found", "QBSavedQueryFix");
        }

    } catch (e) {
        gs.logError("Error removing duplicate --None-- entry: " + e, "QBSavedQueryFix");
    }
}
