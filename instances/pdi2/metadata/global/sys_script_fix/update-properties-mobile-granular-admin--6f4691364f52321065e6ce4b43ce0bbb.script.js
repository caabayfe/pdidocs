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
        'glide.sg.universal_links.unsupported_link_default_native_client',
        'glide.sg.clear_pasteboard_when_backgrounded',
        'glide.sg.button_instance.color_theme.secondary',
        'glide.sg.allow_rooted_jailbroken_device',
        'com.glide.event_manager.mobile_offline_payload_gen_queue.claim_limit',
        'glide.sg.device_encryption_enabled',
        'glide.ui.m.apple-app-site-association-file',
        'glide.sg.reauthentication.single_use_token',
        'glide.sg.rest.authentication_failure_message',
        'glide.sg.universal_links.enabled',
        'glide.ui.m_agents',
        'glide.sg.allowed_external_deeplinks',
        'glide.sg.deeplink.route_to_public_store_if_not_installed',
        'com.glide.event_manager.mobile_offline_payload_gen_queue.hard_limit',
        'glide.sg.image.default.sys_user',
        'glide.sg.universal_links.open_unsupported_links',
        'glide.sg.button_instance.color_theme.primary',
        'glide.sg.require_mobile_application_pin',
        'glide.sg.deeplink.firebase_custom_domain_path',
        'glide.sg.deeplink.instance_domain',
        'glide.sg.hide_applications_screen_image',
        'glide.sg.document_submit_label',
        'glide.sg.block_mobile_attachments_sharing',
        'glide.ui.m_enabled',
        'glide.sg.button_instance.color_theme.destructive',
        'glide.sg.writeback_submit_label',
        'glide.sg.blur_ui_when_backgrounded',
        'glide.sg.list.max_items_number',
        'glide.sg.chart_accessibility.enabled',
        'glide.sg.universal_link_default_view_template'
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
    }

    gs.info('[Mobile Properties Fix] Total properties updated: ' + updateCount + ' out of ' + PROPERTY_NAMES.length);
})();
