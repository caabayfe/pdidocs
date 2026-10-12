var AisMigrationStatusPageHelper = Class.create();
AisMigrationStatusPageHelper.prototype = {
    initialize: function() {
        this.utils = new AISMigrationUtils();
    },

    getMigratedAppsGr: function() {
        var migratedAppsGr = new GlideRecord('sn_aisearch_global_job_completion');
        migratedAppsGr.addQuery('table_name', 'sys_search_context_config');
        migratedAppsGr.query();
        return migratedAppsGr;
    },

    getDisplayValuesForStatusPage: function() {
        var displayValues = [];
        var eligibleApps = this.utils.getSearchConfigurationsToMigrate();

        var migratedApps = this._getMigratedApps();
        for (var a in migratedApps) {
            if (eligibleApps.indexOf(migratedApps[a]) < 0)
                eligibleApps.push(migratedApps[a]);
        }

        var searchAppConfigGr = new GlideRecord('sys_search_context_config');

        var newVariableMap = {};
        for (var i in eligibleApps) {
            if (!searchAppConfigGr.get(eligibleApps[i]))
                continue;

            var zingSACName = searchAppConfigGr.getValue('name');
            var aisSACName = '';

            newVariableMap[eligibleApps[i]] = this._getMigratedAppSysId(eligibleApps[i]);
            var aisSACSysIDs = newVariableMap[eligibleApps[i]];

            for (var sysId in aisSACSysIDs) {
                var activePagePropertyMappingExists = true;
                if (aisSACSysIDs[sysId]) {
                    if (searchAppConfigGr.get(aisSACSysIDs[sysId]))
                        aisSACName = searchAppConfigGr.getValue('name');

                    if (aisSACSysIDs.length > 1)
                        activePagePropertyMappingExists = this._checkWhetherAISSACExistsInSysUXPageProperty(aisSACSysIDs[sysId]);
                }

                var unmigratedSourceObjects = this.utils.getSearchSourcesToMigrate(eligibleApps[i], gs, aisSACSysIDs[sysId]);
                var unmigratedSources = [];
                for (var j in unmigratedSourceObjects) {
                    unmigratedSources.push(unmigratedSourceObjects[j].name);
                }
                var displayValueObj = {};
                displayValueObj['zing'] = zingSACName;

                if (aisSACName)
                    displayValueObj['ais'] = aisSACName;
                else
                    displayValueObj['ais'] = '-None-';

                if (unmigratedSources.length > 0)
                    displayValueObj['unmigrated_sources'] = unmigratedSources.join(',');
                else
                    displayValueObj['unmigrated_sources'] = '-None-';

                if (!aisSACName || (aisSACName && unmigratedSources.length > 0))
                    displayValueObj['status'] = 'Needs migration';
                else if (aisSACName && unmigratedSources.length == 0 && activePagePropertyMappingExists)
                    displayValueObj['status'] = 'Migrated';
                else if (aisSACName && unmigratedSources.length == 0 && !activePagePropertyMappingExists)
                    displayValueObj['status'] = '*Not Active';

                displayValues.push(displayValueObj);
            }
        }

        return displayValues;

    },

    _getMigratedAppSysId: function(zingAppSysID) {
        var migratedAppsGr = new GlideRecord('sn_aisearch_global_job_completion');
        migratedAppsGr.addQuery('table_name', 'sys_search_context_config');
        migratedAppsGr.addQuery('source_sys_id', zingAppSysID);
        migratedAppsGr.query();
        var migratedApssGRDestinationSysIds = [];
        while (migratedAppsGr.next()) {
            var migratedDestinationSysID = migratedAppsGr.getValue('destination_sys_id');
            migratedApssGRDestinationSysIds.push(migratedDestinationSysID);
        }

        if (migratedApssGRDestinationSysIds.length == 0)
            migratedApssGRDestinationSysIds.push('');

        return migratedApssGRDestinationSysIds;
    },

    _getMigratedApps: function() {
        var apps = [];
        var appsGr = new GlideRecord('sn_aisearch_global_job_completion');
        appsGr.addQuery('table_name', 'sys_search_context_config');
        appsGr.query();

        while (appsGr.next()) {
            apps.push(appsGr.getValue('source_sys_id'));
        }
        return apps;
    },

    _checkWhetherAISSACExistsInSysUXPageProperty: function(aisAppSysID) {
        var gr = new GlideRecord('sys_ux_page_property');
        gr.addQuery('name', 'globalSearchDataConfigId');
        gr.addQuery('value', aisAppSysID);
        gr.query();
        return gr.getRowCount() > 0;

    },


    type: 'AisMigrationStatusPageHelper'
};
