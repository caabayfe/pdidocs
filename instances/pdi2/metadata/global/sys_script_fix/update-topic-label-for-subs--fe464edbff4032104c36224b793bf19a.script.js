var scriptName = "sys_script_fix: Update topic label for subs: ";
var table = "sys_kafka_subscription";

updateLabel("topic_ref", "Hermes Topic");
updateLabel("update_topic_ref", "Update Hermes Topic Reference");

function updateLabel(column, newColumnLabel) {
    var gr = new GlideRecord("sys_dictionary");
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
}
