var CSUrlRedirectUtils = Class.create();
CSUrlRedirectUtils.prototype = {
    initialize: function() {
		this.logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup();
	},

    insertCustomerPortalProperties: function(propertyList) {
        this.updatePortalProperties(propertyList, false, true);
    },

    updateBUPortalProperties: function(propertyList) {
        this.updatePortalProperties(propertyList, true, false);
    },

    updatePortalProperties: function(propertyList, includeFlag, insertFlag) {
        var grProp = new GlideRecord('sys_properties');
        grProp.addQuery('name', 'STARTSWITH', 'com.glide.cs.portal_url_mapping.');
        grProp.query();
        while (grProp.next()) {
            try {
                var propertySysId = grProp.getValue("sys_id");

                // Check to exclude or include the property from list.
                if (includeFlag) {
                    if (propertyList.indexOf(propertySysId) == -1) continue;
                } else {
                    if (propertyList.indexOf(propertySysId) != -1) continue;
                }

                var propName = grProp.getValue('name');
                var propScope = grProp.getValue('sys_scope');
                var keyArr = propName.split('.');
                if (keyArr.length != 6) {
                    this.logger.info("VA URL Redirect Migration: Invalid property format for" + propName);
                    continue;
                }
                var portal = keyArr[4];
                var tableName = keyArr[5];

                // Check if the mapping is Custom Portal
                if (portal != 'portal') {
                    var grPortalMapping = this.getPortalMappingGR('portal_mapping', portal, tableName);
                    var templateValue = grProp.getValue('value');
                    var description = grProp.getValue('description');
                    if (grPortalMapping.next()) {
                        if (templateValue != grPortalMapping.getValue('url_template') || description != grPortalMapping.getValue('description')) {
                            grPortalMapping.setValue('url_template', templateValue);
                            grPortalMapping.setValue('description', description);
                            grPortalMapping.update();
                        }
                    } else if (insertFlag) {
                        var portalSysId = portal != '_default' ? this.getPortalSysId(portal) : '';
                        if (portal == '_default' || portalSysId) {
                            this.insertPortalMappingGR('portal_mapping', portalSysId, tableName, templateValue, description, propScope);
                        } else {
                            this.logger.info("VA URL Redirect Migration: Portal doesn't exist for " + propName);
                        }
                    }
                } else {
                    var defaultPortalValue = grProp.getValue('value');
                    var defaultPortalDescription = grProp.getValue('description');
                    var defaultPortalSysId = this.getPortalSysId(defaultPortalValue);
                    var grDefaultPortal = this.getPortalMappingGR('default_portal', '', tableName);
                    if (grDefaultPortal.next()) {
                        if ((defaultPortalSysId && defaultPortalValue != grDefaultPortal.getValue('portal.url_suffix')) || defaultPortalDescription != grDefaultPortal.getValue('description')) {
                            grDefaultPortal.setValue('portal', defaultPortalSysId ? defaultPortalSysId : grDefaultPortal.getValue('portal'));
                            grDefaultPortal.setValue('description', defaultPortalDescription);
                            grDefaultPortal.update();
                        }
                    } else if (defaultPortalSysId && insertFlag) {
                        this.insertPortalMappingGR('default_portal', defaultPortalSysId, tableName, '', defaultPortalDescription, propScope);
                    } else if (insertFlag) {
                        this.logger.info("VA URL Redirect Migration: Portal doesn't exist for " + propName);
                    }
                }
            } catch (error) {
                this.logger.error("VA URL Redirect Migration: Exception while migrating key:" + propName + " with error: " + error.message);
            }
        }
    },


    getPortalMappingGR: function(type, portalSuffix, tableName) {
        var grPortalMapping = new GlideRecord('sys_cs_portal_url_mapping');
        grPortalMapping.addQuery('type', type);
        if (portalSuffix) {
            if (portalSuffix != '_default')
                grPortalMapping.addQuery('portal.url_suffix', portalSuffix);
            else
                grPortalMapping.addQuery('portal', '');
        }
        grPortalMapping.addQuery('table_name', tableName != '_default' ? tableName : '');
        grPortalMapping.query();
        return grPortalMapping;
    },

    insertPortalMappingGR: function(type, portalSysId, tableName, urlTemplate, description, propScope) {
        var grPortalMapping = new GlideRecord('sys_cs_portal_url_mapping');
        grPortalMapping.initialize();
        grPortalMapping.setValue('type', type);
        if (portalSysId)
            grPortalMapping.setValue('portal', portalSysId);
        if (tableName != '_default')
            grPortalMapping.setValue('table_name', tableName);
        if (urlTemplate)
            grPortalMapping.setValue('url_template', urlTemplate);
        grPortalMapping.setValue('description', description);
        grPortalMapping.insert();

        // Scope is not getting populated with correct value during insertion. Hence, doing an update again.
        grPortalMapping.setValue('sys_scope', propScope);
        grPortalMapping.update();
    },

    getPortalSysId: function(portalSuffix) {
        var grPortalList = new GlideRecord('sp_portal');
        grPortalList.addQuery('url_suffix', portalSuffix);
        grPortalList.query();
        if (grPortalList.next())
            return grPortalList.getValue('sys_id');
        return null;
    },

    type: 'CSUrlRedirectUtils'
};
