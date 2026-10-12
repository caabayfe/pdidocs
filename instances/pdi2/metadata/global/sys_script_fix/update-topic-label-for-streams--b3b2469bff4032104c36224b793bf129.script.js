var scriptName = "sys_script_fix: Update topic label for streams: ";

var gr = new GlideRecord("sys_dictionary");
var table = "sys_kafka_stream";
var column = "topic";
var newColumnLabel = "Hermes Topic";

gr.addQuery("name", table);
gr.addQuery("element", column);
gr.query();
if (gr.next()) {
    gr.setValue("column_label", newColumnLabel);
    gr.update();
    gs.info(scriptName + "For table = " + table + ", column = " + column + ", updated label = " + newColumnLabel);
} else {
    gs.error(scriptName + "Couldn't find table = " + table + ", column = " + column + " in sys_dictionary.");
}
