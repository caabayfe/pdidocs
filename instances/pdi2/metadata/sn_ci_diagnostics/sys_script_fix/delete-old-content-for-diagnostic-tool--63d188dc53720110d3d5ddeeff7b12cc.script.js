// Delete Old Diagnostic Records

var old_tables = ["ci_diagnostic_kb", "ci_diagnostic_script"];

old_tables.forEach(function(table) {
    if (gs.tableExists(table))
        deleteAllRecords(table);
});

function deleteAllRecords(table) {
    var gr = new GlideRecord(table);
    gr.query();
    gr.deleteMultiple();
}


// Delete - Old Diagnostic Topic, 4 Topic Blocks, Old Check AWA Issues topic
var topics = ["06b0f875535db410f738ddeeff7b1286", "ef01b0b5535db410f738ddeeff7b12bd", "0ae0bc75535db410f738ddeeff7b12e5", "cad07c75535db410f738ddeeff7b125c", "eff030b5535db410f738ddeeff7b12cc", "f8854d6fc34e3010d81b6e221f40dda2"];

deleteOldTopics(topics);

function deleteOldTopics(topics) {
    var gr = new GlideRecord("sys_cb_topic");
    gr.addQuery("sys_id", topics);
    gr.query();
    gr.deleteMultiple();

}
