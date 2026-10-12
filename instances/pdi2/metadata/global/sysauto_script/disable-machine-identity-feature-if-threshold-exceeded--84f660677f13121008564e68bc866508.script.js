(function() {
    if (gs.getProperty('identity.mi.enabled') == 'false') {
        return;
    }
    var agg = new GlideAggregate('sys_mi_request');
    agg.addAggregate('COUNT');
    agg.query();
    var totalRecords = 0;
    if (agg.next()) {
        totalRecords = agg.getAggregate('COUNT');
    }
    var maxRecordsAllowed = GlideProperties.getInt("identity.mi.max.volume.allowed", 30000000);
    if (totalRecords > maxRecordsAllowed) {
        gs.info('identity_mi: Disabling machine identity feature as total number of records in mi request table exceeds threshold');
        gs.setProperty("identity.mi.enabled", "false");
    }
}());
