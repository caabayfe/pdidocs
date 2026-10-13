var LOG_PREFIX = "**SCOM Cleanup Fix Script: ";
var PARAM_TABLE = "em_connector_parameters";

// =====================================

if (pm.isZboot()) {
    gs.info(LOG_PREFIX + "fresh instance, nothing to clean up. Exiting.");
} else {
    gs.info(LOG_PREFIX + "deleting metric-related params on the old SCOM connector");
    deleteParams();
}

gs.info(LOG_PREFIX + "Done cleaning up old SCOM connector metric rules and params");

// =====================================

function deleteParams() {
    deleteRecord(PARAM_TABLE, "3d04e42993e31200734c31f6357ffb1d"); // metric_chunk_size
    deleteRecord(PARAM_TABLE, "a7966f605b110110ea1d1b800481c73f"); // logPayloadForDebug
}

function deleteRecord(table, sys_id) {
    var gr = new GlideRecord(table);
    gr.get(sys_id);
    if (gr.isValidRecord()) {
        gr.deleteRecord();
    }
}
// =====================================
