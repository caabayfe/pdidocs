var LOG_PREFIX = "[DEF0854504 dedupe_custmodified_ccsi]: ";
try {
    gs.info(LOG_PREFIX + "Starting deduplication of custmodified_ccsi");
    dedupeCustomerModifiedCCSI();
} catch (e) {
    gs.error(LOG_PREFIX + "An exception occurred while running the fix script: ", e);
}

function dedupeCustomerModifiedCCSI() {
    var TABLE = "custmodified_ccsi";

    var gr = new GlideRecord(TABLE);
    if (!gr.isValid()) {
        gs.info(LOG_PREFIX + "Table " + TABLE + " is not present; nothing to do");
        return;
    }

    // Walk every row ordered by name, then by creation time, keeping the first
    // (earliest-created) row seen for each name and deleting every later
    // duplicate. The rows are identical apart from sys metadata, so which one
    // survives is immaterial.
    gr.orderBy("name");
    gr.orderBy("sys_created_on");
    gr.setWorkflow(false);
    gr.query();

    var seen = {};
    var namesWithDuplicates = 0;
    var rowsDeleted = 0;
    while (gr.next()) {
        var name = gr.getValue("name");
        if (!name)
            continue; // leave blank-name rows untouched

        if (seen[name]) {
            if (seen[name] === 1)
                namesWithDuplicates++;
            seen[name]++;
            gr.deleteRecord();
            rowsDeleted++;
        } else {
            seen[name] = 1;
        }
    }

    gs.info(LOG_PREFIX + "Done: removed " + rowsDeleted + " duplicate row(s) across " + namesWithDuplicates + " name(s)");
}
