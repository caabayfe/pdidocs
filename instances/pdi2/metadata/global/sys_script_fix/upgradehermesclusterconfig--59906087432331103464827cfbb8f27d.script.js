var clusterGr = new GlideRecord("hermes_cluster_config");
clusterGr.query();
while (clusterGr.next()) {
    clusterGr.setValue("is_managed", true);
    clusterGr.setValue("is_adc_accessible", true);
    clusterGr.setValue("is_primary_for_service", false); // managed clusters don't use the primary field
    clusterGr.setValue("service_id", "bfe548804320311041a0e8625ab8f242"); // set as hermes-internal
    clusterGr.update();
}
