var AISMigrationUtils = Class.create();
AISMigrationUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    initialize: function() {
        var user = gs.getUser();
        if (!user.hasRole('ais_admin') || !user.hasRole('search_application_admin'))
            throw new Error(gs.getMessage("ais_admin and search_application_admin role is required to use this script"));
        this.arrayUtils = new global.ArrayUtil();
    },

    PLUGIN_INDEXED_SOURCES: [
        "sc_task",
        "change_request",
        "change_task",
        "core_company",
        "sys_user_group",
        "incident",
        "problem",
        "sc_request",
        "sc_req_item",
        "cmn_location"
    ],

    getEligibleSearchAppsQuery: function() {
        return 'sys_idIN' + (this.getSearchConfigurationsToMigrate().join(','));
    },

    getSearchConfigurationsToMigrate: function() {
        var apps = [];
        var uxApps = new GlideRecordSecure('sys_ux_registry_m2m_category');
        // Filter on the "Workspace" category
        uxApps.addQuery('experience_category', 'afb4e3e173322010f0ca1e666bf6a726');
        // Only apps with the the Unified Navigation parent app will show up in the global search bar contexts menu
        uxApps.addQuery('page_registry.parent_app', 'c86a62e2c7022010099a308dc7c26022');

        // Only get the pages where search is enabled in the chrome_header property, and
        // there are globalSearchDataConfigId and global_search_configurations properties configured,
        // as these are the properties that link to a Search App Config
        uxApps.addQuery('page_registry', 'IN', this._getSearchEnabledPages());
        var propertyJoin2 = uxApps.addJoinQuery('sys_ux_page_property', 'page_registry', 'page');
        propertyJoin2.addCondition('name', 'globalSearchDataConfigId');
        var propertyJoin3 = uxApps.addJoinQuery('sys_ux_page_property', 'page_registry', 'page');
        propertyJoin3.addCondition('name', 'global_search_configurations');

        var ans = ['c861cea2c7022010099a308dc7c26041'];
        uxApps.query();
        while (uxApps.next()) {
            // Lookup the property that has the SAC ID for this Polaris App
            var propertiesGR = new GlideRecordSecure('sys_ux_page_property');
            propertiesGR.addQuery('name', 'globalSearchDataConfigId');
            propertiesGR.addQuery('page', uxApps.page_registry);
            propertiesGR.query();
            while (propertiesGR.next()) {
                // Look up the actual SAC record given the ID from the globalSearchDataConfigId property
                var confSysID = propertiesGR.getValue('value');

                var sacGr = new GlideRecordSecure('sys_search_context_config');
                if (sacGr.get(confSysID) && sacGr.search_engine == 'ai_search') {
                    var migratedGr = new GlideRecordSecure('sn_aisearch_global_job_completion');
                    migratedGr.addQuery('table_name', 'sys_search_context_config');
                    migratedGr.addQuery('destination_sys_id', confSysID);
                    migratedGr.query();
                    if (migratedGr.next())
                        confSysID = migratedGr.getValue('source_sys_id');
                }
                if (!ans.includes(confSysID))
                    ans.push(confSysID);
            }
        }
        var migratedApps = this._getMigratedApps();
        for (var a in migratedApps) {
            if (ans.indexOf(migratedApps[a]) < 0)
                ans.push(migratedApps[a]);
        }

        for (var i in ans) {
            var unmigratedSourceObjects = this.getSearchSourcesToMigrate(ans[i], false, null);
            if (unmigratedSourceObjects.length > 0) {
                apps.push(ans[i]);
            }
        }
        return apps;
    },

    getDataSourcesToIndex: function(migrationSysID) {
        var sources = [];
        var stagedGr = new GlideRecordSecure('sn_aisearch_global_job_staging');
        stagedGr.addQuery('state', 'accept');
        stagedGr.addQuery('table_name', 'ais_search_source');
        stagedGr.addQuery('migration_orchestration', migrationSysID);
        stagedGr.query();

        while (stagedGr.next()) {
            var changesGr = new GlideRecordSecure('sn_aisearch_global_job_staging_change');
            changesGr.addQuery('field', 'datasource');
            changesGr.addQuery('migration_staging_record', stagedGr.getUniqueValue());
            changesGr.query();

            while (changesGr.next())
                sources.push(changesGr.getValue('new_value'));
        }

        return this._addDotWalkAttrSources(migrationSysID, this._filterIndexedSources(sources));
    },

    _filterIndexedSources: function(sources) {
        var alreadyIndexed = [];
        var filteredSources = [];
        var ingestHistoryGR = new GlideAggregate("ais_ingest_datasource_stats");
        ingestHistoryGR.groupBy("datasource");
        ingestHistoryGR.addQuery("datasource", "IN", sources);
        ingestHistoryGR.query();
        while (ingestHistoryGR.next()) {
            alreadyIndexed.push(ingestHistoryGR.getValue("datasource"));
        }
        for (var i = 0; i < sources.length; i++) {
            var filter = false;
            for (var j = 0; j < alreadyIndexed.length; j++) {
                if (alreadyIndexed[j] === sources[i]) filter = true;
            }
            if (!filter) filteredSources.push(sources[i]);
        }
        return filteredSources;
    },

    //Handle indexing for dot_walk_fields attribute changes
    _addDotWalkAttrSources: function(migrationSysID, sources) {
        var arr = [];
        var changesGr = new GlideRecordSecure('sn_aisearch_global_job_staging_change');
        changesGr.addQuery('migration_staging_record.migration_orchestration', migrationSysID);
        changesGr.addQuery('field', 'attribute');
        changesGr.addQuery('new_value', '2d45349173101010170b56b80ff6a7c8'); // dot_walk_fields attribute sys_id
        changesGr.query();
        while (changesGr.next()) {
            var attrChangesGr = new GlideRecordSecure('sn_aisearch_global_job_staging_change');
            attrChangesGr.addQuery('migration_staging_record', changesGr.migration_staging_record);
            attrChangesGr.addQuery('field', 'source');
            attrChangesGr.query();
            if (attrChangesGr.next()) {
                var value = attrChangesGr.getValue('new_value');
                if (arr.indexOf(value) < 0)
                    arr.push(value);
            }
        }

        for (var i = 0; i < sources.length; i++) {
            if (arr.indexOf(sources[i]) < 0)
                arr.push(sources[i]);
        }
        return arr;
    },

    getDictionariesToPublish: function(profileId) {
        var dictionaryNames = [];
        var dictionaryGR = new GlideRecordSecure("ais_dictionary");
        var dictionaryLinkGR = new GlideAggregate("ais_search_profile_ais_dictionary_m2m");
        dictionaryLinkGR.groupBy("dictionary");
        dictionaryLinkGR.addQuery("profile", profileId);
        dictionaryLinkGR.query();
        while (dictionaryLinkGR.next()) {
            dictionaryGR.get(dictionaryLinkGR.getValue("dictionary"));
            dictionaryNames.push(dictionaryGR.getValue("name"));
        }
        return dictionaryNames;
    },

    getSearchProfilesToPublish: function(zingConfigId) {
        var jobGr = new GlideRecordSecure('sn_aisearch_global_job_completion');
        jobGr.addQuery('table_name', 'sys_search_context_config');
        jobGr.addQuery('source_sys_id', zingConfigId);
        jobGr.query();

        if (jobGr.next()) {
            var aisAppGr = new GlideRecordSecure("sys_search_context_config");
            if (aisAppGr.get(jobGr.destination_sys_id)) {
                return aisAppGr;
            }
        }
        return null;
    },

    isAnyChangeNeedsReview: function(migrationSysId) {
        var stagingChangeGr = new GlideRecordSecure('sn_aisearch_global_job_staging');
        stagingChangeGr.addQuery('migration_orchestration', migrationSysId);
        stagingChangeGr.addQuery('state', 'needs_review');
        stagingChangeGr.query();
        return stagingChangeGr.hasNext();
    },

    /**
     * If "active" migration record exits, return null.
     * If not exits, create a "pending migration" and return its sysId.
     * "active" means states NOT in "completed" or "migration failed".
     */
    createNewMigrationOrchestrationIfNeeded: function() {
        var currentActiveSysId = this.getActiveOrchestrationRecord();
        // if there is already exits active record, don't do anything
        if (currentActiveSysId) {
            gs.info("Migration record already exists. Not creating another migration record");
            return null;
        }

        var orcheGR = new GlideRecordSecure('sn_aisearch_global_migration_job');
        orcheGR.setValue('state', 'NOT_MIGRATED');
        // Add all ais_admin users to the watch_list by default
        orcheGR.setValue('watch_list', this._getUsersWithAisAdminRole());

        return orcheGR.insert();
    },

    _getUsersWithAisAdminRole: function() {
        var users = [];

        var userRoleGr = new GlideRecordSecure('sys_user_has_role');
        userRoleGr.addQuery('role', 'e523e2f2c7130010d1cfd9795cc2606d'); // Role sys_id for ais_admin
        userRoleGr.addActiveQuery();
        userRoleGr.query();

        while (userRoleGr.next()) {
            users.push(userRoleGr.getValue('user'));
        }
        return users;
    },

    getOrCreateActiveOrchestrationRecord: function() {
        var existingRecord = this.getActiveOrchestrationRecord();
        if (existingRecord)
            return existingRecord;

        // Create a migration job record if it does not exist yet
        orcheGR = new GlideRecordSecure('sn_aisearch_global_migration_job');
        orcheGR.initialize();
        return orcheGR.insert();
    },

    getActiveOrchestrationRecord: function() {
        if (!(gs.getCurrentApplicationId() == "global")) {
            gs.addErrorMessage(gs.getMessage('You need to be in global scope to access migration records'));
            return;
        }

        var activeStates = 'NOT_MIGRATED, CONFIGURATION_CONVERTED, CONFIGURATION_COMMITTED, INDEXING';
        var orcheGR = new GlideRecordSecure('sn_aisearch_global_migration_job');
        orcheGR.addQuery('state', 'IN', activeStates);
        orcheGR.orderBy('sys_created_on');
        orcheGR.setLimit(1);
        orcheGR.query();

        if (orcheGR.next())
            return orcheGR.getUniqueValue();

        return;
    },

    getSearchSourcesToMigrate: function(confSysID, logger, aisConfId) {
        var zingSearchSourceObjects = [];

        var sourceIDs = [];
        var linkGR = new GlideRecordSecure('m2m_search_context_config_search_source');
        linkGR.addQuery('search_context_config', confSysID);
        linkGR.query();
        while (linkGR.next()) {
            sourceIDs.push(linkGR.getValue('source'));
        }
        var sourceGR = new GlideRecordSecure('sys_search_source');
        sourceGR.addQuery('sys_id', 'IN', sourceIDs);
        sourceGR.orderBy('source_table');
        sourceGR.query();

        while (sourceGR.next()) {
            var searchSourceTable = sourceGR.getValue('source_table');
            var searchSourceName = sourceGR.getValue('sys_name');
            var searchSourceSysID = sourceGR.getUniqueValue();

            var migratedRecords = new GlideRecordSecure('sn_aisearch_global_job_completion');
            migratedRecords.addQuery('table_name', 'sys_search_context_config');
            migratedRecords.addQuery('source_sys_id', confSysID);
            if (aisConfId != null && aisConfId != 'undefined')
                migratedRecords.addQuery('destination_sys_id', aisConfId);
            migratedRecords.query();

            if (migratedRecords.next()) {
                var migratedApp = new GlideRecordSecure("sys_search_context_config");
                if (migratedApp.get(migratedRecords.destination_sys_id)) {
                    if (this._checkIfMigrated(migratedApp, searchSourceTable) && (this.searchSourceExists(sourceGR) || this._shouldSkipSearchSource(sourceGR.getUniqueValue()))) {
                        if (logger)
                            logger.info('Search source: ' + searchSourceName + ' for table: ' + searchSourceTable + ' exists or has already been migrated');
                        continue;
                    }
                    if (!this._isTableIndexable(searchSourceTable))
                        continue;

                    if (this._isChildSource(searchSourceSysID, migratedApp))
                        continue;
                }
            }

            if (!gs.tableExists(searchSourceTable)) {
                if (logger)
                    logger.info('Skipping search source: ' + searchSourceName + ' for table: ' + searchSourceTable + ' as table does not exist');
                continue;
            }

            var zingSearchSourceObject = {};
            zingSearchSourceObject['sys_id'] = searchSourceSysID;
            zingSearchSourceObject['source_table'] = searchSourceTable;
            zingSearchSourceObject['name'] = searchSourceName;
            zingSearchSourceObjects.push(zingSearchSourceObject);
        }
        return zingSearchSourceObjects;
    },

    _checkIfMigrated: function(migratedApp, table) {
        var m2mSource = new GlideRecordSecure('ais_search_profile_ais_search_source_m2m');
        m2mSource.addQuery("profile", migratedApp.search_profile);
        m2mSource.addQuery("search_source.datasource", table);
        m2mSource.query();
        return m2mSource.hasNext();
    },

    _shouldSkipSearchSource: function(sysSearchSourceSysID) {
        var migratedRecords = new GlideRecordSecure('sn_aisearch_global_job_completion');
        migratedRecords.addQuery('table_name', 'sys_search_source');
        migratedRecords.addQuery('source_sys_id', sysSearchSourceSysID);
        migratedRecords.query();
        return migratedRecords.hasNext();
    },

    searchSourceExists: function(searchSourceGR) {
        var sourceExists = new GlideRecordSecure('ais_search_source');
        sourceExists.addQuery('datasource.source', searchSourceGR.source_table);
        sourceExists.query();
        while (sourceExists.next()) {
            if (sourceExists.condition == searchSourceGR.condition || sourceExists.condition.toString().trim() == searchSourceGR.condition)
                return sourceExists;
        }
    },

    allowCommit: function(migrationJobSysID) {
        var stagingRecords = new GlideRecordSecure('sn_aisearch_global_job_staging');
        stagingRecords.addQuery('migration_orchestration', migrationJobSysID);
        stagingRecords.addQuery('state', 'needs_review');
        stagingRecords.query();
        return stagingRecords.hasNext();
    },

    _isTableIndexable: function(table) {
        var util = new sn_ais.AisUtil();
        return util.isTableIndexable(table);
    },

    _isChildSource: function(sourceSysID, searchAppConfigGr) {
        var sourceGr = new GlideRecordSecure('sn_aisearch_global_job_completion');
        sourceGr.addQuery('table_name', 'sys_search_source');
        sourceGr.addQuery('source_sys_id', sourceSysID);
        sourceGr.query();

        if (sourceGr.next()) {
            var profileM2mGr = new GlideRecordSecure('ais_search_profile_ais_search_source_m2m');
            profileM2mGr.addQuery('profile', searchAppConfigGr.getValue('search_profile'));
            profileM2mGr.addQuery('search_source', sourceGr.getValue('destination_sys_id'));
            profileM2mGr.query();
            return profileM2mGr.hasNext();
        }
        return false;
    },

    canEnableAIS: function() {
        var canEnable = false;
        var jobGr = new GlideRecordSecure('sn_aisearch_global_job_completion');
        jobGr.addQuery('table_name', 'sys_search_context_config');
        jobGr.query();

        while (jobGr.next()) {
            var prop = new GlideRecordSecure('sys_ux_page_property');
            prop.addQuery('name', 'globalSearchDataConfigId');
            prop.addQuery('value', jobGr.source_sys_id);
            prop.query();

            if (prop.next())
                canEnable = true;
        }
        return canEnable;
    },

    _getSearchEnabledPages: function() {
        var id = [];
        var uxProp = new GlideRecordSecure('sys_ux_page_property');
        uxProp.addEncodedQuery('name=chrome_header^valueLIKEsearchEnabled');
        uxProp.query();

        while (uxProp.next()) {
            var value = JSON.parse(uxProp.getValue('value'));
            if (value.privatePage.searchEnabled)
                id.push(uxProp.getValue('page'));
        }
        return id;
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

    type: 'AISMigrationUtils'
});
