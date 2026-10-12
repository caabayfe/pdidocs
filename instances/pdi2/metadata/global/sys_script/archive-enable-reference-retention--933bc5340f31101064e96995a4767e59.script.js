if (!GlideTableDescriptor.isValid(current.table)) {
    gs.info('No Archive table for ' + current.table);
} else {
    var tables = GlideDBObjectManager.get().getAllExtensions(current.table);
    for (i = 0; i < tables.size(); i++) {
        var checkMigrated = new GlideRecord('sys_archive_ref_migration');
        checkMigrated.addQuery('table', 'ar_' + tables.get(i));
        checkMigrated.setLimit(1);
        checkMigrated.query();
        if (!checkMigrated.next()) {
            if (GlideTableDescriptor.isValid('ar_' + tables.get(i))) {
                var newMigration = new GlideRecord("sys_archive_ref_migration");
                newMigration.initialize();
                newMigration.setValue('rule', current.sys_id);
                newMigration.setValue('table', 'ar_' + tables.get(i));
                newMigration.setValue('reference_migration_progress', 'waiting');
                newMigration.insert();
            }
        }
    }
    //Also get insert related records tables as well
    var id = current.sys_id;
    if (!(id === undefined)) {
        var related = new GlideRecord('sys_archive_related');
        related.addQuery('archive_map', id);
        related.addQuery('action', 'archive');
        related.query();
        while (related.next()) {
            if (!GlideTableDescriptor.isValid('ar_' + related.getValue('table'))) {
                gs.log('Related Record table: ' + related.getValue('table') + ' not created yet');
                continue;
            }

            // check if this table has already been migrated, insert if not
            var checkRelatedMigrated = new GlideRecord('sys_archive_ref_migration');
            checkRelatedMigrated.addQuery('table', 'ar_' + related.getValue('table'));
            checkRelatedMigrated.setLimit(1);
            checkRelatedMigrated.query();
            if (!checkRelatedMigrated.next()) {
              var newRelatedMigration = new GlideRecord("sys_archive_ref_migration");
              newRelatedMigration.initialize();
              newRelatedMigration.setValue('rule', current.sys_id);
              newRelatedMigration.setValue('table', 'ar_' + related.getValue('table'));
              newRelatedMigration.setValue('reference_migration_progress', 'waiting');
              newRelatedMigration.insert();
            }
        }
    }
}
