(function executeRule(current, previous /*null when async*/ ) {
    try {
        var gr = new GlideRecord('multi_factor_browser_fingerprint');
        if (!gr.isValid()) {
            logDebug("Table 'multi_factor_browser_fingerprint' is not available.");
            return;
        }
        gr.addQuery('user', current.user);
        gr.query();
        var count = gr.getRowCount();
        logDebug("Deleting " + count + " remembered browsers for user:" + current.user);
        if (count > 0) {
            gr.deleteMultiple();
        }
    } catch (e) {
        gs.error("Delete Remembered Browsers BR: error occured while deleting entries from 'multi_factor_browser_fingerprint' table.");
        gs.error(e);
    }
})(current, previous);

function logDebug(message) {
    gs.debug("Delete Remembered Browsers BR: " + message);
}
