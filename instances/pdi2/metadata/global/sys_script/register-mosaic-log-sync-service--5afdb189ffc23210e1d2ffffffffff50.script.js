(function executeRule(current, previous /*null when async*/ ) {
    gs.info("Checking and activating Mosaic Log Sync Service as there was a sys service endpoint operation");
    (new MosaicHermesUtils()).activateLogSyncService();
})(current, previous);
