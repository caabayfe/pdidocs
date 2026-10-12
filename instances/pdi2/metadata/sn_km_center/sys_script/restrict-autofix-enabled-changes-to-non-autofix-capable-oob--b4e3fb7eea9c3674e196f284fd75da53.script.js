(function executeRule(current, previous /*null when async*/) {
    // Keep in sync with the UI Policy "Lock Autofix enabled for non-autofix-capable
    // OOB scans" — same 6 sys_ids. Anything NOT in this list (the 3 autofix-capable
    // OOB scans, or a custom scan an admin creates) is left fully editable.
    var AUTOFIX_LOCKED_SCAN_IDS = [
        'd0685b5293e172104915f72fa803d6c1', // Article length
        '463087e3ff1032100710fffffffffffc', // Bad links
        'ae644ed77fa122101eabb6be7d866544', // Image alt tags (script-based)
        '073b1d84efda831059664b73e2e42204', // Stale or expiring article
        '86090a80b7d64b0fa49535926bb4767a', // Potential duplicate articles
        '47e15ed02b8c03100d24f6c7f291bf71'  // Article readability
    ];

    if (current.autofix_enabled.changes() && AUTOFIX_LOCKED_SCAN_IDS.indexOf(current.getUniqueValue()) !== -1) {
        gs.addErrorMessage(gs.getMessage('Autofix enabled cannot be changed for this scan.'));
        current.setAbortAction(true);
    }
})(current, previous);
