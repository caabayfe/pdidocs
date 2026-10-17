// PRB2050429: clear the write-audit customization on DiscoveryFunctions so the shipped OOB applies on upgrade.
(function cleanupPRB2050429Customization() {
    var UPDATE_NAME = 'sys_script_include_4bcc49be0a0a0b1c00f5801137a5d422';
    var PROP_NAME   = 'prb2050429_willBeReplacedOnUpgrade';
    var LOG_SRC     = 'FixScript:PRB2050429';

    // Marker value = willBeReplacedOnUpgrade captured before the write audit. Absent => nothing to do.
    var propGR = new GlideRecord('sys_properties');
    if (!propGR.get('name', PROP_NAME)) {
        gs.info('[' + LOG_SRC + '] Marker not found; no-op.');
        return;
    }

    var wasReplaceableBeforePatch = propGR.getValue('value');

    if (wasReplaceableBeforePatch !== 'true' && wasReplaceableBeforePatch !== 'false') {
        gs.warn('[' + LOG_SRC + '] Unexpected marker value "' + wasReplaceableBeforePatch + '"; leaving marker. No-op.');
        return;
    }

    // false => genuine pre-existing customization; leave it untouched.
    if (wasReplaceableBeforePatch === 'false') {
        gs.info('[' + LOG_SRC + '] Pre-existing customization (marker=false). Leaving untouched.');
        removeMarker(propGR);
        return;
    }

    // true => only the write audit's entry; delete it so the OOB overwrites.
    var upd = new GlideRecord('sys_update_xml');
    upd.addQuery('name', UPDATE_NAME);
    upd.addNullQuery('remote_update_set'); // local only; never a retrieved update set
    upd.addQuery('category', 'customer');
    upd.setWorkflow(false);
    upd.deleteMultiple(); // deletes all matching local entries

    // Confirm gone before clearing the marker, so a failed delete can retry.
    var verify = new GlideRecord('sys_update_xml');
    verify.addQuery('name', UPDATE_NAME);
    verify.addNullQuery('remote_update_set');
    verify.addQuery('category', 'customer');
    verify.setWorkflow(false);
    verify.query();
    if (verify.hasNext()) {
        gs.error('[' + LOG_SRC + '] Entry still present after delete; keeping marker for retry.');
        return;
    }

    gs.info('[' + LOG_SRC + '] Deleted local customer entry for ' + UPDATE_NAME + '.');
    removeMarker(propGR);

    function removeMarker(propGR) {
        propGR.setWorkflow(false);
        if (propGR.deleteRecord())
            gs.info('[' + LOG_SRC + '] Marker property removed.');
        else
            gs.error('[' + LOG_SRC + '] Failed to remove marker property ' + PROP_NAME + '.');
    }
})();
