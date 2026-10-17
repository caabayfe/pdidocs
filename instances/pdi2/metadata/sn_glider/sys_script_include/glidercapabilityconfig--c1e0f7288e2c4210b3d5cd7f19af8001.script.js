class GliderCapabilityConfig {

    static SELECTED_PERSONA_PREFERENCE = 'sn_glider.ui.selected_persona';
    static CUSTOM_CAPABILITIES_PREFERENCE = 'sn_glider.ui.custom_capabilities';

    static CAPABILITY_TABLE = 'sn_glider_capability';
    static PERSONA_TABLE = 'sn_glider_persona';

    static MAINT_ROLE = 'maint';
    static GLIDER_ADMIN_ROLE = 'sn_glider.admin';

    static PersonaType = {
        Pro: 'pro',
        Vibe: 'vibe',
        Custom: 'custom'
    };

    static #getAllFeatures() {
        var features = [];
        var gr = new GlideRecord(GliderCapabilityConfig.CAPABILITY_TABLE);
        gr.orderBy('order');
        gr.query();
        while (gr.next()) {
            if (!gr.canRead()) continue;
            var notAllowedRolesValue = gr.getValue('not_allowed_roles');
            features.push({
                sys_id: gr.getUniqueValue(),
                label: gr.getDisplayValue('label'),
                description: gr.getDisplayValue('description'),
                icon: gr.getValue('icon'),
                feature_id: gr.getValue('capability_id'),
                order: parseInt(gr.getValue('order')) || 0,
                not_allowed_roles: notAllowedRolesValue
                    ? notAllowedRolesValue.split(',').map(function(role) { return role.trim(); }).filter(Boolean)
                    : []
            });
        }
        return features;
    }

    static #getUserRoles() {
        var roles = gs.getUser().getRoles() + '';
        return roles.split(',').map(function(role) { return role.trim(); }).filter(Boolean);
    }

    static #hasSearchAccess(userRoles) {
        var value;
        try {
            value = gs.getProperty('glide.ui.can_search', '');
        } catch (e) {
            gs.error('GliderCapabilityConfig - failed to read system property glide.ui.can_search, hiding Search: ' + e);
            return false;
        }

        if (!value || value.trim() === '') {
            return true;
        }

        var allowedRoles = value.split(',').map(function(role) { return role.trim(); }).filter(Boolean);
        return userRoles.some(function(role) { return allowedRoles.indexOf(role) !== -1; });
    }

    // For maint and glider admin roles, bypass the not_allowed_for_roles check
    static #isIDEAdminOrMaint() {
        var user = gs.getUser();
        return user.hasRole(GliderCapabilityConfig.MAINT_ROLE) || user.hasRole(GliderCapabilityConfig.GLIDER_ADMIN_ROLE);
    }

    static #isFeatureAvailableForUser(feature, userRoles, isIDEAdminOrMaint) {
        if (feature.feature_id === 'search-instance' && !GliderCapabilityConfig.#hasSearchAccess(userRoles)) {
            return false;
        }
        if (!feature.not_allowed_roles.length) {
            return true;
        }
        if (isIDEAdminOrMaint) {
            return true;
        }
        return !feature.not_allowed_roles.some(function(role) { return userRoles.indexOf(role) !== -1; });
    }

    static #getAllPersonas() {
        var personas = [];
        var gr = new GlideRecord(GliderCapabilityConfig.PERSONA_TABLE);
        gr.query();
        while (gr.next()) {
            if (!gr.canRead()) continue;
            var featuresValue = gr.getValue('capabilities');
            personas.push({
                persona_id: gr.getValue('persona_id'),
                label: gr.getDisplayValue('label'),
                sys_ids: featuresValue
                    ? featuresValue.split(',').map(function(id) { return id.trim(); }).filter(Boolean)
                    : []
            });
        }
        return personas;
    }

    // Maps sys_ids (as stored in persona.features and the custom_features preference) to feature_ids
    static #sysIdsToFeatureIds(sysIds, availableFeatures) {
        var lookup = {};
        availableFeatures.forEach(function(feature) { lookup[feature.sys_id] = feature.feature_id; });
        var result = [];
        sysIds.forEach(function(id) {
            if (lookup[id]) {
                result.push(lookup[id]);
            }
        });
        return result;
    }

    static getConfig() {
        var user = gs.getUser();

        var selectedPersona = user.getPreference(GliderCapabilityConfig.SELECTED_PERSONA_PREFERENCE)
            || GliderCapabilityConfig.PersonaType.Pro;

        var customFeaturesValue = user.getPreference(GliderCapabilityConfig.CUSTOM_CAPABILITIES_PREFERENCE) || '';
        var customSysIds = customFeaturesValue
            ? customFeaturesValue.split(',').map(function(id) { return id.trim(); }).filter(Boolean)
            : [];

        var allFeatures = GliderCapabilityConfig.#getAllFeatures();
        var userRoles = GliderCapabilityConfig.#getUserRoles();
        var isIDEAdminOrMaint = GliderCapabilityConfig.#isIDEAdminOrMaint();
        var availableFeatures = allFeatures.filter(function(feature) {
            return GliderCapabilityConfig.#isFeatureAvailableForUser(feature, userRoles, isIDEAdminOrMaint);
        });

        // Server returns the full persona list so the client can populate the persona dropdown
        // directly (no hardcoded client-side dropdown options).
        var personas = GliderCapabilityConfig.#getAllPersonas().map(function(persona) {
            return {
                persona_id: persona.persona_id,
                label: persona.label,
                features: GliderCapabilityConfig.#sysIdsToFeatureIds(persona.sys_ids, availableFeatures)
            };
        });
        var customFeatureIds = GliderCapabilityConfig.#sysIdsToFeatureIds(customSysIds, availableFeatures);

        var features = availableFeatures.map(function(feature) {
            return {
                sys_id: feature.sys_id,
                label: feature.label,
                description: feature.description,
                icon: feature.icon,
                feature_id: feature.feature_id,
                order: feature.order
            };
        });

        return {
            features: features,
            personas: personas,
            selectedPersona: selectedPersona,
            customFeatureIds: customFeatureIds
        };
    }
}
