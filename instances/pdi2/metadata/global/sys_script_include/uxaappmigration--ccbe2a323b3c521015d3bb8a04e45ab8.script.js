var UXAAppMigration = Class.create();
UXAAppMigration.prototype = {
    initialize: function() {
        this.config = {
            endpoint: '/apps/all'
        };
        this.mongoData = null;
        this.app_table_name = 'sys_analytics_app';
        this.now_experience_table_name = "sys_ux_page_registry";
        this.hardCodedAppSysIdMapping = {
            "ui-builder": "fb978e92c349d11047538b5b2840dd6a",
            "theme-builder": "89807648b7701110d7bcea56ee11a999"
        };
        this.WEB_CHANNEL_ID = '6496ef61c7001010393d265c95c260b9';
        this.MOBILE_CHANNEL_ID = '3c70585353001010d69cddeeff7b1226';
        this.now_experience_channel_sys_id = 'c8ae7e45732130107d804c9885f6a7a5';
        this.next_experience_parent_app_sys_id = "635911e2732130107d804c9885f6a78f";
        this.retryPropertyName = 'com.glide.appsee.uxaapp_migration_current_retry_count';
        this.MAX_RETRY_COUNT = gs.getProperty('com.glide.appsee.uxaapp_migration_max_retry_count', 10);
        this.currentRetryCount = parseInt(this.findSysProperty(this.retryPropertyName) || 0);
    },
    updateSysProperty: function(name, value) {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', name);
        gr.query();
        if (gr.next()) {
            gr.setValue('value', value);
            gr.setWorkflow(false);
            gr.update();
        }
    },
    insertSysProperty: function(name, value) {
        var gr = new GlideRecord('sys_properties');
        gs.initialize();
        gr.setValue('name', name);
        gr.setValue('value', value);
        gr.setWorkflow(false);
        gr.insert();
    },

    findSysProperty: function(name) {
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', name);
        gr.query();
        if (gr.next()) {
            return gr.getValue('value');
        }
    },
    getRetryCount: function() {
        return {
            max: this.MAX_RETRY_COUNT,
            current: this.currentRetryCount
        };
    },
    getApiResponse: function(payload) {
        if (this.mongoData) {
            return this.mongoData;
        }
        var client = new AppseeHttpClientForMigration(this.config, {});
        var response = client.doPost(payload);
        try {
            this.mongoData = JSON.parse(response);
        } catch (e) {
            gs.error("UXAAppMigration:" + "Error while parsing response from Appsee: " + response);
        }
        return this.mongoData;
    },
    getAppsData: function() {
        var instanceId = gs.getProperty("instance_id");
        var payload = {
            "parent_api_key": instanceId + ":" + this.next_experience_parent_app_sys_id
        };
        try {
            var appsData = this.getApiResponse(payload);
            return appsData;
        } catch (ex) {
            throw new Error('Failed to get page details from API + ', ex);
        }
    },
    migrateApps: function() {
        try {
			this.updateRetryCount();
            // DEF0670667: Appsee Deprecation - copying missing web and mobile apps to bucket table.
            this.copyMissingAppsToBucket();

            var existingAppSysIds = this.getExistingApps();
            var appsData = this.getAppsData();
            var complete = this.insertAppsData(appsData, existingAppSysIds);
            var migrationComplete = complete ? 'complete' : 'in-progress';
            gs.info('UXA Migration job for Apps ran completely, current status - ' + migrationComplete);
            return complete;
        } catch (ex) {
			throw new Error('UXA Migration job for Apps failed -',  JSON.stringify(ex));
        }
    },

    insertAppsData: function(responseData, existingAppSysIds) {
        try {
            var appMap = {};
            var appGR = new GlideRecord(this.app_table_name);
            var problematicSysIdCount = 0;
            var migratedRecordCount = 0;
            responseData.forEach((app) => {
                var app_name = app["Name"];
                var channel = app["Channel"];

                var keys = app["APIKey"].split(':');
                if (keys.length == 3)
                    var childAppSysId = keys[2];
                else {
                    gs.error("UXAAppMigration :  APIKey Parsing error, incorrectly formed APIKey. Skipping record: " + app["APIKEY"]);
                    return;
                }

                if (childAppSysId in this.hardCodedAppSysIdMapping)
                    childAppSysId = this.hardCodedAppSysIdMapping[childAppSysId];

                if (childAppSysId.length < 32) {
                    problematicSysIdCount++;
                    gs.info("UXAAppMigration: Problematic sys_id found during migration. SysId= " + childAppSysId + ", Name=" + app_name);
                    return;
                }

                if (appMap[childAppSysId]) {
                    gs.info("UXAAppMigration: Duplicate child app sysId found for app_name " + app_name + ", app_sys_id=" + childAppSysId);
                    return;
                } else
                    appMap[childAppSysId] = 1;

                if (!existingAppSysIds.includes(childAppSysId)) {
                    appGR.initialize();
                    appGR.setWorkflow(true);
                    appGR.setValue("application_name", app_name);
                    appGR.setValue("analytics_channel", this.now_experience_channel_sys_id);
                    appGR.setValue("app_sys_id", childAppSysId);
                    appGR.setValue('table_name', this.now_experience_table_name);
                    var status = appGR.insert();
                    if (status != null) {
                        migratedRecordCount++
                        gs.info("Inserted app: " + app_name);
                    } else {
                        gs.info("UXAAppMigration: App insert failed for : " + app_name);
                    }
                }
            });
            gs.info("UXAAppMigration: Migrated app count: " + migratedRecordCount + ", Problematic sys_id count: " + problematicSysIdCount);
            return true;

        } catch (e) {
            gs.error("UXAAppMigration : inserting into sys_analytics_app table failed with error:" + e);
            return false;
        }
    },

    getExistingApps: function() {
        var appsGR = new GlideRecord(this.app_table_name);
        var appSysIds = [];
        appsGR.query();
        while (appsGR.next()) {
            appSysIds.push(appsGR.getValue("app_sys_id"));
        }
        return appSysIds;
    },

    isMigrationComplete: function() {
        var existingAppSysIds = this.getExistingApps();
        var appsData = this.getAppsData();
        var mongoAppSysIds = appsData.map(app => {
            var childAppSysId = app["APIKey"].split(':')[2];
            if (childAppSysId in this.hardCodedAppSysIdMapping)
                childAppSysId = this.hardCodedAppSysIdMapping[childAppSysId];
            return childAppSysId;
        });
        for (var i = 0; i < mongoAppSysIds.length; i++) {
            if (!existingAppSysIds.includes(mongoAppSysIds[i])) {
                gs.info("Pending migration:" + mongoAppSysIds[i]);
                return false;
            }
        }
        return true;
    },

    copyMissingAppsToBucket: function() {
        gs.info("[UXAAppMigration] Migration from sys_analytics_app table to sys_analytics_bucket table is started");
        var migratedCount = 0;
        var skippedCount = 0;

        // Step 1: Load existing bucket_document_ids into an array
        var existingBucketIds = [];
        var bucketGR = new GlideRecord('sys_analytics_bucket');
        bucketGR.query();
        while (bucketGR.next()) {
            existingBucketIds.push(bucketGR.getValue('bucket_document_id'));
        }

        // Step 2: Query apps with desired channels
        var appGR = new GlideRecord(this.app_table_name);
        appGR.addEncodedQuery('analytics_channel=6496ef61c7001010393d265c95c260b9^ORanalytics_channel=3c70585353001010d69cddeeff7b1226');
        appGR.query();

        while (appGR.next()) {
            var appSysId = appGR.getValue('app_sys_id');

            // Skip if already in bucket
            if (existingBucketIds.indexOf(appSysId) !== -1) {
                skippedCount++;
                gs.info("[UXAAppMigration] Skipping existing bucket entry for app_sys_id: " + appSysId);
                continue;
            }

            try {
                var bucketGR = new GlideRecord('sys_analytics_bucket');
                bucketGR.initialize();
                bucketGR.setWorkflow(false);
                bucketGR.setValue('bucket_document_id', appSysId);
                bucketGR.setValue('application_name', appGR.getValue('application_name'));
                bucketGR.setValue('bucket_table_name', appGR.getValue('table_name'));
                bucketGR.setValue('analytics_channel', appGR.getValue('analytics_channel'));
                bucketGR.setValue('enable_unauthenticated_user_tracking', appGR.getValue('enable_unauthenticated_user_tracking'));
                bucketGR.setValue('enabled', appGR.getValue('active'));
                var documentGR = new GlideRecord(appGR.getValue('table_name'));
                documentGR.get(appSysId);
                bucketGR.setValue('sys_scope', sn_app_analytics.SNAnalytics.getBucketScope(documentGR));

                // Migrate metadata from config if present
                var configGR = new GlideRecord('sys_analytics_app_config');
                configGR.addQuery('sys_analytics_app', appGR.getUniqueValue());
                configGR.query();
                if (configGR.next()) {
                    bucketGR.setValue('bucket_metadata', configGR.getValue('configuration'));
                    bucketGR.setValue('bucket_metadata_customer_override', configGR.getValue('customer_override_configuration'));
                }

                bucketGR.insert();
                migratedCount++;
                gs.info("[UXAAppMigration] Migrated app to bucket: " + appGR.getValue('application_name'));

            } catch (e) {
                gs.error("[UXAAppMigration] Migration from sys_analytics_app table to sys_analytics_bucket table is failed for " + appGR.getValue('application_name') + ",  reason : " + e.message);
            }
        }

        gs.info("[UXAAppMigration] Migration from sys_analytics_app table to sys_analytics_bucket table is completed. Summary = " + migratedCount + ", Skipped: " + skippedCount);
    },

    updateRetryCount: function() {
        if (this.currentRetryCount == 0)
            this.insertSysProperty(this.retryPropertyName, ++this.currentRetryCount);
        else
            this.updateSysProperty(this.retryPropertyName, ++this.currentRetryCount);
    },

    type: 'UXAAppMigration'
};
