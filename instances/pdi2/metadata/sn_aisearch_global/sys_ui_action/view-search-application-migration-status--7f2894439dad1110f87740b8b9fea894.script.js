function showMigrationInfo() {
    var migrationInfo = new GlideModal('sn_aisearch_global_next_exp_ais_status', false, 1000);
    migrationInfo.setTitle('All Zing search applications should be migrated before enabling AI Search for Next Experience.');
    migrationInfo.render();
}
