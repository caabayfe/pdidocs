var AisMigrationWorkspaceHandler = Class.create();
AisMigrationWorkspaceHandler.prototype = {
    initialize: function() {},

    zingToAISearch: function() {
        var migCompletionGr = new GlideRecord('sn_aisearch_global_job_completion');
        migCompletionGr.addQuery('table_name', 'sys_search_context_config');
        migCompletionGr.query();

        while (migCompletionGr.next())
            this._updatePageProperties(migCompletionGr.getValue('source_sys_id'), migCompletionGr.getValue('destination_sys_id'));

        this._publishProfile();
    },

    aiSearchToZing: function() {
        var migCompletionGr = new GlideRecord('sn_aisearch_global_job_completion');
        migCompletionGr.addQuery('table_name', 'sys_search_context_config');
        migCompletionGr.query();

        while (migCompletionGr.next()) {
            this._updatePageProperties(migCompletionGr.getValue('destination_sys_id'), migCompletionGr.getValue('source_sys_id'));
        }
    },

    _updatePageProperties: function(previousValue, newValue) {
        // This table lists properties for UX Pages (e.g. workspaces)
        var propertiesGR = new GlideRecord('sys_ux_page_property');
        // One of these properties, globalSearchDataConfigId, specifies which SAC should be used by that page/workspace
        propertiesGR.addQuery('name', 'globalSearchDataConfigId');
        // To find workspaces using a particular SAC, look for globalSearchDataConfigId properties with a VALUE of that SAC's sys_id
        propertiesGR.addQuery('value', previousValue);
        propertiesGR.query();

        propertiesGR.setValue('value', newValue);
        propertiesGR.updateMultiple();
    },

    //Publish AI Search related search profiles
    _publishProfile: function() {
        var apps = [];
        var propGR = new GlideRecord('sys_ux_page_property');
        propGR.addQuery('name', 'globalSearchDataConfigId');
        propGR.query();
        while (propGR.next())
            apps.push(propGR.getValue('value'));

        var aisAppGr = new GlideRecord('sys_search_context_config');
        aisAppGr.addQuery('sys_id', 'IN', apps);
        aisAppGr.addQuery('search_engine', 'ai_search');
        aisAppGr.addQuery('search_profile.state', '!=', 'PUBLISHED');
        aisAppGr.query();
        while (aisAppGr.next()) {
            var profile = aisAppGr.search_profile.name;
            var dictionaries = new AISMigrationUtils().getDictionariesToPublish(aisAppGr.search_profile);
            for (var i = 0; i < dictionaries.length; i++)
                new sn_ais.Synchronizer().publishDictionary(dictionaries[i]);

            new sn_ais.Synchronizer().publishProfile(profile);
        }
    },

    enableAIS: function() {
        var canEnable = true;
        var util = new AISMigrationUtils();
        var apps = util.getSearchConfigurationsToMigrate();

        if (apps.length > 0) {
            canEnable = false;
            for (var i in apps) {
                var context = new GlideRecord("sys_search_context_config");
                context.get(apps[i]);
                apps[i] = context.name;
            }
        }
        if (canEnable) {
            this.zingToAISearch();

            var property = new GlideRecord("sys_properties");
            property.addQuery('name', 'glide.ui.polaris.ais_ready');
            property.query();
            if (property.next() && property.getValue("value") === 'false') {
                property.setValue("value", "true");
                property.update();
            }
            gs.addInfoMessage(gs.getMessage('AI Search for Next Experience is enabled. All logged in users need to logout and then log back in to utilize AI Search for Next Experience.'));
        } else
            gs.addErrorMessage(gs.getMessage('There are un-migrated Zing configurations still present for "{0}" applications. Please convert them into AI Search configs before enabling AI Search for Next Experience.', apps.join(', ')));
    },

    disableAIS: function() {
        this.aiSearchToZing();

        var property = new GlideRecord("sys_properties");
        property.addQuery('name', 'glide.ui.polaris.ais_ready');
        property.query();
        if (property.next() && property.getValue("value") === "true") {
            property.setValue("value", "false");
            property.update();
        }
        gs.addInfoMessage(gs.getMessage('AI Search for Next Experience is disabled'));
    },

    type: 'AisMigrationWorkspaceHandler'
};
