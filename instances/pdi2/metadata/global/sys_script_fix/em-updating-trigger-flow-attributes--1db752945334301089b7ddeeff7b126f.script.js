gs.info("**Updating sys_flow_metric_trigger.condition attributes");
fixDictionary();


function fixDictionary() {
    var dictionary = new GlideRecord("sys_dictionary");
    if (!dictionary.isValid()) {
        gs.error("Invalid table: sys_dictionary");
        return;
    }

    dictionary.addQuery("name", "sys_flow_metric_trigger");
    dictionary.addQuery("element", "condition");

    dictionary.query();
    if (dictionary.next()) {
        dictionary.setValue("attributes", "readable=true,condition_builder=v2,show_condition_count=true");
        if (!dictionary.update()) {
            gs.error("**Could not update " + dictionary.getValue('name') + "." + dictionary.getValue('element') + " attributes");
        } else {
            gs.info("**Updated " + dictionary.getValue('name') + " " + dictionary.getValue('element') + " attributes**");
        }

    } else {
        gs.error("**Could not find sys_flow_metric_trigger.condition dictionary entry");
    }
}
