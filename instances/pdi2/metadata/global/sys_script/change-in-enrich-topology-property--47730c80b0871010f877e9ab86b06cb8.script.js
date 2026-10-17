(function executeRule(current, previous /*null when async*/ ) {
        gs.log("Changing operational_status ofDynamic CI groups services due to property - evt_mgmt.enrich_topology_dynamic_cis change");
        gr = new GlideRecord("cmdb_ci_query_based_service");
        gr.addQuery("operational_status", "1");
        gr.query();

        while (gr.next()) {
            gr.setValue("operational_status", "2");
            gr.update();
            gr.setValue("operational_status", "1");
            gr.update();
        }
})(current, previous);
