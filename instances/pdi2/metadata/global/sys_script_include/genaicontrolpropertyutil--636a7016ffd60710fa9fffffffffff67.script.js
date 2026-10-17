var GenAIControlPropertyUtil = Class.create();
GenAIControlPropertyUtil.prototype = {
    initialize: function() {},

    /**
     * Writes a Generative AI control property, honouring domain separation.
     * When the instance is domain separated, the value is written to the per-domain
     * application property store (sys_application_property_value) for the resolved
     * domain. Otherwise it falls back to the global sys_properties record.
     *
     * @param {string} prop - fully qualified property name (e.g. sn_generative_ai.enable_native_translation)
     * @param {*} value - value to store
     * @param {string} [domainId] - optional target domain sys_id; defaults to the current session domain
     * @returns {boolean} true if the write succeeded, false otherwise
     */
    setPropertyValue: function(prop, value, domainId) {
        if (!this._hasWriteAccess(prop)) {
            gs.error("GenAIControlPropertyUtil: user lacks write access for property " + prop);
            return false;
        }
        var resolvedDomainId = this._domain(domainId);
        if (resolvedDomainId && resolvedDomainId != 'global')
            return this._setApplicationPropertyValue(prop, value, resolvedDomainId);
        return this._setGlobalSysProperty(prop, value);
    },

    /**
     * Reads a Generative AI control property, honouring domain separation.
     *
     * @param {string} prop - fully qualified property name (e.g. sn_generative_ai.enable_native_translation)
     * @param {string} [domainId] - optional target domain sys_id; defaults to the current session domain
     * @returns {string|null} the raw configured value, or null/nil if not set - callers apply their own default.
     */
    getPropertyValue: function(prop, domainId) {
        try {
            return GlideApplicationProperty.getValue(prop, this._domain(domainId));
        } catch (error) {
            return gs.getProperty(prop);
        }
    },

    _domain: function(domainId) {
        if (domainId)
            return domainId;
        var session = gs.getSession();
        if (session && typeof session.getCurrentDomainID == 'function')
            return session.getCurrentDomainID() || 'global';
        return 'global';
    },

    _hasWriteAccess: function(prop) {
        // write_roles source of truth is the base sys_properties record (GlideApplicationProperty
        // does not enforce roles). No property row or no roles means the write is allowed.
        var sysPropertiesGr = new GlideRecord('sys_properties');
        sysPropertiesGr.addQuery('name', prop);
        sysPropertiesGr.query();
        if (!sysPropertiesGr.next())
            return true;
        var writeRoles = sysPropertiesGr.getValue('write_roles');
        return gs.nil(writeRoles) || gs.hasRole(writeRoles);
    },

    _setApplicationPropertyValue: function(prop, value, domainId) {
        // GlideApplicationProperty.setValue enforces that the running transaction is in the
        // property's scope, which is not true for cross-scope callers (e.g. the admin console UI).
        // queryNoDomain/updateNoDomain are also not permitted in scoped apps. So the per-domain
        // value row is written directly for the current session domain, mirroring the platform
        // logic in com.glide.db.domain.ApplicationProperty.setValue.
        try {
            var appPropertyGr = new GlideRecord('sys_application_property');
            appPropertyGr.addQuery('name', prop);
            appPropertyGr.query();

            if (!appPropertyGr.next())
                return false;

            var appPropertySysId = appPropertyGr.getUniqueValue();

            var domainRowSysId = null;
            var globalRowSysId = null;

            var valueGr = new GlideRecord('sys_application_property_value');
            valueGr.addQuery('sys_application_property', appPropertySysId);
            valueGr.query();

            while (valueGr.next()) {
                var rowDomain = valueGr.getValue('sys_domain');
                if (rowDomain == domainId)
                    domainRowSysId = valueGr.getUniqueValue();
                else if (rowDomain == 'global')
                    globalRowSysId = valueGr.getUniqueValue();
            }

            if (domainRowSysId) {
                var updateGr = new GlideRecord('sys_application_property_value');
                if (!updateGr.get(domainRowSysId))
                    return false;

                updateGr.setValue('value', String(value));
                return !!updateGr.update();
            }

            var insertGr = new GlideRecord('sys_application_property_value');
            insertGr.initialize();
            insertGr.setValue('sys_application_property', appPropertySysId);
            insertGr.setValue('sys_domain', domainId);
            insertGr.setValue('value', String(value));

            // Link the override to the closest visible base row (global) for hierarchy metadata.
            if (globalRowSysId)
                insertGr.setValue('sys_overrides', globalRowSysId);

            return !!insertGr.insert();
        } catch (error) {
            gs.error(
                "GenAIControlPropertyUtil: failed to update application property value " +
                prop + " - " + error.toString()
            );
            return false;
        }
    },

    _setGlobalSysProperty: function(prop, value) {
        //Opting for GlideRecord instead of gs.setProperty because updating the property from the Now Assist Admin Scope or any cross scope is not feasible.
        try {
            var sysPropertiesGr = new GlideRecord('sys_properties');
            sysPropertiesGr.addQuery('name', prop);
            sysPropertiesGr.query();
            if (sysPropertiesGr.next()) {
                sysPropertiesGr.setValue('value', String(value));
                sysPropertiesGr.update();
                return true;
            }
            return false;
        } catch (error) {
            gs.error("GenAIControlPropertyUtil: failed to update global property " + prop + " - " + error.toString());
            return false;
        }
    },

    type: 'GenAIControlPropertyUtil'
};
