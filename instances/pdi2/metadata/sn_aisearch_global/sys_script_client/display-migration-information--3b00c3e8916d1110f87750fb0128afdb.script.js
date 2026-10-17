function onLoad() {
    var state = g_form.getValue('state');
    if (state === 'NOT_MIGRATED' || state === 'INDEXING_COMPLETE' || state === 'MIGRATION_FAILED') {
        var migrationInfo = new GlideModal('sn_aisearch_global_next_exp_ais_status', false, 1000);
        migrationInfo.setTitle(getMessage('All Zing search applications should be migrated before enabling AI Search for Next Experience.'));
        migrationInfo.render();
    }
}
