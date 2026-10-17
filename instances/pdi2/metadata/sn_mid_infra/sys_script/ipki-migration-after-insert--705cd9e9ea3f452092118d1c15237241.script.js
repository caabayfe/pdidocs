(function executeRule(current, previous /*null when async*/) {
    new sn_mid_infra.IpkiMigrationProbeService().issueProbeForMigrationRecord(current);
})(current, previous);
