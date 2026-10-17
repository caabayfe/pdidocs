(function executeRule(current, previous /*null when async*/) {
    if (current.getValue('queue') !== 'input' || current.getValue('topic') !== 'MigrateToIPKI') {
        return;
    }
    new IpkiMigrationManager().handleMigrateProbeResponse(current);
})(current, previous);
