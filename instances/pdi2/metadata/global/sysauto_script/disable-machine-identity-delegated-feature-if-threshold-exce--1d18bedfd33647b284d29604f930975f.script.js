(function() {
    if (gs.getProperty('identity.mi.delegated.enabled') == 'false') {
        return;
    }
    var agg = new GlideAggregate('sys_mi_delegated_request');
    agg.addAggregate('COUNT');
    agg.query();
    var totalRecords = 0;
    if (agg.next()) {
        totalRecords = agg.getAggregate('COUNT');
    }
    var maxRecordsAllowed = GlideProperties.getInt("identity.mi.delegated.max.volume.allowed", 30000000);
    if (totalRecords > maxRecordsAllowed) {
        gs.info('identity_mi_delegated: Disabling machine identity delegated feature as total number of records in mi delegated request table exceeds threshold');
        gs.setProperty("identity.mi.delegated.enabled", "false");
    }
}());
