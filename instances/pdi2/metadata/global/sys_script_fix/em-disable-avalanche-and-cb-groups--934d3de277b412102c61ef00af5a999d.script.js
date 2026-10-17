var log = "Run 'EM - disable avalanche and class based groups' fix script for upgrading customers\n";


var propertiesGr = new GlideRecord('sys_properties');
propertiesGr.addQuery('sys_updated_by', 'admin');
if (!isNewInstance()) {
    var properties = ["sa_analytics.generalized_patterns_enabled", "sa_analytics.agg.avalanche_graph_enabled", "sa_analytics.agg.avalanche_generalized_enabled"];
    propertiesGr.addQuery("name", 'IN', properties);
    propertiesGr.query();
    var first = true;
    while (propertiesGr.next()) {
        if (first) {
            log += "Deleted the folowing properties: ";
            first = false;
        }
        log += propertiesGr.getValue('name') + " with the value '" + propertiesGr.getValue('value') + "'\n";
        propertiesGr.deleteRecord();
    }
} else {
    propertiesGr.addQuery('name', 'sa_analytics.specific_patterns_enabled');
    propertiesGr.query();
    if (propertiesGr.next()) {
        propertiesGr.setValue("value", "false");
        if (propertiesGr.update()) {
            log += "Updated the the value of sa_analytics.specific_patterns_enabled property to false\n";
        } else {
            gs.error("the system property sa_analytics.specific_patterns_enabled was not updated");
        }

    }
}
log += "Finish to run 'EM - disable avalanche and class-based groups' fix script.";
gs.info(log);

function isNewInstance() {
    var alertGr = new GlideRecord('em_alert');
    if (!alertGr.isValid()) {
        // table doesn't exist, must be new instance
        return true;
    }
    alertGr.setLimit(10);
    alertGr.query();
    return alertGr.getRowCount() < 10; // more than 10 alerts means it's an existing customer
}
