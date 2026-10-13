gs.info("**Updating display label of 'Distributed' cluster type");
fixDictionary();

function fixDictionary() {
    var dictionary = new GlideRecord("sys_choice");
    if (!dictionary.isValid()) {
        gs.error("Invalid table: sys_choice");
        return;
    }

    dictionary.addQuery("name", "ecc_agent_cluster");
    dictionary.addQuery("element", "type");
    dictionary.addQuery("value", "Distributed");

    dictionary.query();
    if (dictionary.next()) {
        dictionary.setValue("label", "Distributed Metric Cache Cluster");
        dictionary.setValue("hint", "Distributed Metric Cache Cluster");
        if (!dictionary.update()) {
            gs.error("**Could not update ecc_agent_cluster.type from 'Distributed' to 'Distributed Metric Cache Cluster'");
        } else {
            gs.info("**Updated ecc_agent_cluster.type from 'Distributed' to 'Distributed Metric Cache Cluster'");
        }

    } else {
        gs.error("**Could not find ecc_agent_cluster.type.Distributed sys_choice entry");
    }
}
