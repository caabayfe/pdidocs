/*
 * Title: Ensure mobile_admin on read/write roles for mobile-related properties
 * Runs: once (Fix Script), after High Security is active
 * Note: Requires security_admin elevation to write sys_properties metadata
 */

(function executeFix() {
    //Only run on upgrade
    if (GlidePluginManager.isZboot())
        return;
    // Always run with awareness: changing sys_properties triggers a cache flush.
    // Keep changes minimal and in a single transaction per property.

    var PROPERTY_NAMES = [
        'glide.sg.offline.incremental.retrieved.grace_period',
        'glide.sg.offline.scheduled_download.enabled',
        'glide.sg.offline.caching.limit',
        'glide.sg.offline.incremental.enabled',
        'glide.sg.offline.incremental.silent_push.min_wait_time',
        'com.glide.event_handler.generate_incremental_offline_payload',
        'glide.sg.offline.incremental.client_polling_interval',
        'com.glide.event_handler.generate_offline_payload',
        'glide.sg.offline.incremental.record_watcher_expiration',
        'glide.sg.offline.incremental.silent_push.max_pushes_per_hour'
    ];

    /**
     * Helper to merge roles (comma-separated list -> string)
     * This is to avoid duplicates or overwriting existing roles
     * @param {*} existing 
     * @param {*} toAddArray 
     * @returns the merged roles 
     */
    function mergeRoles(existing, toAddArray) {
        var set = {};
        (existing || '').split(',').forEach(function(role) {
            role = (role || '').trim();
            if (role) set[role] = true;
        });
        toAddArray.forEach(function(role) {
            set[role] = true;
        });
        return Object.keys(set).sort().join(',');
    }

    // Desired additional roles for mobile properties
    var EXTRA_READ_ROLES = ['mobile_admin']; // keep platform default 'admin'
    var EXTRA_WRITE_ROLES = ['mobile_admin']; // keep platform default 'security_admin'

    var gr = new GlideRecord('sys_properties');
    gr.addQuery('name', 'IN', PROPERTY_NAMES.join(','));
    gr.query();

    var updateCount = 0;
    while (gr.next()) {
        var newRead = mergeRoles(gr.getValue('read_roles'), EXTRA_READ_ROLES);
        var newWrite = mergeRoles(gr.getValue('write_roles'), EXTRA_WRITE_ROLES);

        gr.setValue('read_roles', newRead);
        gr.setValue('write_roles', newWrite);
        gr.setWorkflow(false);
        gr.update();

        updateCount++;
        gs.info('[Mobile Properties Fix] Updated roles for property: ' + gr.getValue('name'));
    }

    gs.info('[Mobile Properties Fix] Total properties updated: ' + updateCount + ' out of ' + PROPERTY_NAMES.length);
})();
