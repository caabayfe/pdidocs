var ConfigurationHubAceUtil = Class.create();
ConfigurationHubAceUtil.prototype = {
    initialize: function() {
        this.ACE_APP_CONFIG_TABLE_NAME = 'sn_ace_app_config';
        this.PAGE_REGISTRY_TABLE_NAME = 'sys_ux_page_registry';
        this.EXCLUDED_ACE_CONSOLES = [
            '1a418990530d0d10a86bddeeff7b1200', // App Builder
            'f0d91c8a87650110a4a2c077f6cb0b3e', // ACE Base Experience
            'f77d01e15b31011011ca51d11581c7ce', // Admin Center
        ];
    },

    getACEConsoles: function() {
        let aceConsoles = [];
        let aceConsolesGr = new GlideRecord(this.ACE_APP_CONFIG_TABLE_NAME);
        aceConsolesGr.addQuery('sys_id', 'NOT IN', this.EXCLUDED_ACE_CONSOLES.join(','));
        aceConsolesGr.orderBy('name');
        aceConsolesGr.query();
        while (aceConsolesGr.next()) {
            let name = aceConsolesGr.name.getDisplayValue();
            let urlPath = this._getAppConfigUrlPath(aceConsolesGr.app_config);
            if (name && urlPath)
                aceConsoles.push({
                    name,
                    urlPath
                });
        }

        return aceConsoles;
    },

    _getAppConfigUrlPath: function(appConfigSysId) {
        let pageRegistryGr = new GlideRecord(this.PAGE_REGISTRY_TABLE_NAME);
        pageRegistryGr.addQuery('admin_panel', appConfigSysId);
        pageRegistryGr.query();
        if (!pageRegistryGr.hasNext())
            return null;

        pageRegistryGr.next();
        const urlPath = `/now/${pageRegistryGr.getValue('path')}`;

        return urlPath;
    },

    type: 'ConfigurationHubAceUtil'
};

/* Sample Usage

var chAceUtil = new ConfigurationHubAceUtil();

chAceUtil.getACEConsoles(); => [{name: 'ACE console 1',urlPath: '/now/ace-console-1'}]
*/
