/**
 * Fix Script: Enable Soft PIN enrollment for instances with sn_voice_aia active
 *
 * Context: The new property glide.auth_factors.softpin.enrollment.enabled defaults to false.
 * For backward compatibility, instances that already have the Voice AIA plugin active
 * should have enrollment enabled automatically.
 *
 * Note: The soft_pin plugin is always active (loaded via com.glide.core), so this
 * fix script runs on every upgrade. Only instances with sn_voice_aia active get
 * enrollment enabled — all others remain disabled by default.
 *
 * Rollback: Set glide.auth_factors.softpin.enrollment.enabled to 'false' and deactivate
 * app modules a45bca09ff0032108a03ffffffffff6e, fdfcc649ff0032108a03ffffffffffac.
 */
(function() {
    var PROPERTY_NAME = 'glide.auth_factors.softpin.enrollment.enabled';
    var VOICE_AIA_PLUGIN = 'sn_voice_aia';
    var SEPARATOR_MODULE_SYSID = 'a45bca09ff0032108a03ffffffffff6e';
    var ENROLL_MODULE_SYSID = 'fdfcc649ff0032108a03ffffffffffac';

    try {
        if (GlidePluginManager.isActive(VOICE_AIA_PLUGIN)) {
            _setPropertyValue(PROPERTY_NAME, 'true');
            _setAppModulesActive(true);
            gs.info('Soft PIN enrollment enabled: ' + VOICE_AIA_PLUGIN + ' plugin is active (backward compatibility)');
        } else {
            _setAppModulesActive(false);
            gs.info('Soft PIN enrollment remains disabled: ' + VOICE_AIA_PLUGIN + ' plugin is not active');
        }
    } catch (e) {
        gs.error('Failed to configure Soft PIN enrollment: ' + e.message);
    }

    function _setPropertyValue(name, value) {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', name);
        gr.query();
        if (gr.next()) {
            gr.setValue('value', value);
            gr.update();
        }
    }

    function _setAppModulesActive(active) {
        var gr = new GlideRecord('sys_app_module');
        gr.addQuery('sys_id', 'IN', SEPARATOR_MODULE_SYSID + ',' + ENROLL_MODULE_SYSID);
        gr.query();
        while (gr.next()) {
            gr.setValue('active', active);
            gr.update();
        }
    }
})();
