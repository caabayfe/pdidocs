var crossScopeCustomRecordsService = Class.create();
crossScopeCustomRecordsService.prototype = {
    initialize: function() {},
    // Function to create a single record of sys_sg_mobile_application
    getOrCreateMobileApplicationRecord: function(appName, appType) {
        var deepLinkPath = appType.toLowerCase();
        var deepLinkURLScheme = "sn" + appType.toLowerCase();

        var existingGR = new GlideRecordSecure("sys_sg_mobile_application");
        existingGR.addQuery("name", appType);
        existingGR.addQuery("client_type_header", appType);
        existingGR.query();
        if (existingGR.next()) {
            gs.info("[crossScopeCustomRecordsService] Mobile app record already exists for type: " + appType);
            return {
                sys_id: existingGR.getUniqueValue(),
                client_type: appType,
                client_type_request_header: appType,
                deep_link_path: deepLinkPath,
                deep_linking_url_scheme: deepLinkURLScheme
            };
        }

        var mobileAppGR = new GlideRecordSecure("sys_sg_mobile_application");
        try {
            mobileAppGR.initialize();
            mobileAppGR.setValue("name", appType);
            mobileAppGR.setValue("client_type_header", appType);
            mobileAppGR.setValue("app_banner_title", appName);
            // TODO future enhancement - update app_banner_description
            // TODO future enhancement - update app_banner_image with app icon 256 x 256
            mobileAppGR.setValue("custom_scheme", deepLinkURLScheme);
            mobileAppGR.setValue("link_path", deepLinkPath);
            var insertedSysId = mobileAppGR.insert();
            gs.info(
                "Successfully created sys_sg_mobile_application record with sysId: " +
                mobileAppGR.getUniqueValue()
            );
        } catch (error) {
            gs.error("Error inserting sys_sg_mobile_application record: " + error);
            if (mobileAppGR.isValidRecord()) {
                mobileAppGR.deleteRecord();
                gs.info("Deleted partially created sys_sg_mobile_application record");
                return;
            }
        }

        return {
            sys_id: insertedSysId,
            client_type: appType,
            client_type_request_header: appType,
            deep_link_path: deepLinkPath,
            deep_linking_url_scheme: deepLinkURLScheme
        };
    },
    // Function to create a single record of sys_push_application
    getOrCreatePushApplicationRecord: function(appType) {
        var pushAppDisplayName = appType + " Mobile Application";
        var pushAppName = appType + "PushApp";

        var existingGR = new GlideRecordSecure("sys_push_application");
        existingGR.addQuery("name", pushAppName);
        existingGR.query();
        if (existingGR.next()) {
            gs.info("[crossScopeCustomRecordsService] Push application already exists for type: " + appType);
            return {
                sys_id: existingGR.getUniqueValue(),
                app_name: pushAppName,
                mobile_channel_name: pushAppDisplayName
            };
        }

        var pushAppGR = new GlideRecordSecure("sys_push_application");
        try {
            pushAppGR.initialize();
            pushAppGR.setValue("display_name", pushAppDisplayName);
            pushAppGR.setValue("name", pushAppName);
            pushAppGR.setValue("push", "Direct");
            var insertedSysId = pushAppGR.insert();
            gs.info(
                "Successfully created sys_push_application record with sysId: " +
                pushAppGR.getUniqueValue()
            );
        } catch (error) {
            gs.error("Error inserting sys_push_application record: " + error);
            if (pushAppGR.isValidRecord()) {
                pushAppGR.deleteRecord();
                gs.info("Deleted partially created sys_push_application record");
                return;
            }
        }

        return {
            sys_id: insertedSysId,
            app_name: pushAppName,
            mobile_channel_name: pushAppDisplayName
        };
    },
    // Function to create a single record of sys_sg_native_client
    getOrCreateNativeClientRecord: function(appType, appName, navigationBar, clientTheme, pushAppGR) {
        var existingGR = new GlideRecordSecure("sys_sg_native_client");
        existingGR.addQuery("name", appName);
        existingGR.addQuery("type", appType);
        existingGR.query();
        if (existingGR.next()) {
            gs.info("[crossScopeCustomRecordsService] Native client already exists for: " + appName);
            return {
                sys_id: existingGR.getUniqueValue(),
                geolocation_enabled: existingGR.getValue("geolocation_enabled")
            };
        }

        var nativeClientGR = new GlideRecordSecure("sys_sg_native_client");
        try {
            nativeClientGR.initialize();
            nativeClientGR.setValue("name", appName);
            nativeClientGR.setValue("type", appType);
            nativeClientGR.setValue("navigation", navigationBar);
            nativeClientGR.setValue("mobile_theme", clientTheme);
            nativeClientGR.setValue("offline_enabled", false);
            nativeClientGR.setValue("geolocation_enabled", false);
            if (pushAppGR) {
                nativeClientGR.setValue("push_application", pushAppGR);
            }
            var insertedSysId = nativeClientGR.insert();
            gs.info(
                "Successfully created sys_sg_native_client record with sysId: " +
                nativeClientGR.getUniqueValue()
            );
        } catch (error) {
            gs.error("Error inserting sys_sg_native_client record: " + error);
            if (nativeClientGR.isValidRecord()) {
                nativeClientGR.deleteRecord();
                gs.info("Deleted partially created sys_sg_native_client record");
                return;
            }
        }

        return {
            sys_id: insertedSysId,
            geolocation_enabled: false
        };
    },
    // Function to create a single record of oauth_entity
    getOrCreateOAuthEntityRecord: function(appType) {
        var oauthRecordName = appType + " Mobile App";
        var redirectionUrl = appType.toLowerCase() + "appauth://";

        var existingGR = new GlideRecordSecure("oauth_entity");
        existingGR.addQuery("name", oauthRecordName);
        existingGR.query();
        if (existingGR.next()) {
            gs.info("[crossScopeCustomRecordsService] OAuth entity already exists for: " + oauthRecordName);
            return {
                sys_id: existingGR.getUniqueValue(),
                name: oauthRecordName,
                client_id: existingGR.getValue("client_id"),
                redirection_url: redirectionUrl,
                redirection_scheme: appType.toLowerCase() + "appauth"
            };
        }

        var oauthEntityGR = new GlideRecordSecure("oauth_entity");
        try {
            oauthEntityGR.initialize();
            oauthEntityGR.setValue("name", oauthRecordName);
            oauthEntityGR.setValue("redirect_url", redirectionUrl);
            oauthEntityGR.setValue("public_client", true);
            oauthEntityGR.setValue("skip_authorize", true); //this sets the 'Disable consent screen' value, to disable the consent dialog on login for custom apps (same as GA apps)
            var insertedSysId = oauthEntityGR.insert();
            gs.info(
                "Successfully created oauth_entity record with sysId: " +
                oauthEntityGR.getUniqueValue()
            );
        } catch (error) {
            gs.error("Error inserting oauth_entity record: " + error);
            if (oauthEntityGR.isValidRecord()) {
                oauthEntityGR.deleteRecord();
                gs.info("Deleted partially created oauth_entity record");
                return;
            }
        }

        return {
            sys_id: insertedSysId,
            name: oauthRecordName,
            client_id: oauthEntityGR.getValue("client_id"),
            redirection_url: redirectionUrl,
            redirection_scheme: appType.toLowerCase() + "appauth"
        };
    },
    createUpdateSet: function(updateSetName, updateSetDescription, records) {
        var updateSetRecord = new GlideRecordSecure("sys_update_set");
        updateSetRecord.initialize();
        updateSetRecord.application = "global";
        updateSetRecord.name = updateSetName;
        updateSetRecord.description = updateSetDescription;
        var updateSetSysId = updateSetRecord.insert();

        var updateSet = new GlideUpdateSet();
        updateSet.set(updateSetSysId);

        var updateManager = new GlideUpdateManager2();
        for (var key in records) {
            var record = new GlideRecord(key);
            record.get(records[key]);
            updateManager.saveRecord(record);
        }
    },
    createMobileAppRecords: function(appName, appType, navigationBar, clientTheme) {
        var mobileAppRecordManifestData = this.getOrCreateMobileApplicationRecord(
            appName,
            appType
        );
        var pushAppRecordManifestData = this.getOrCreatePushApplicationRecord(appType);
        var nativeClientRecordManifestData = this.getOrCreateNativeClientRecord(
            appType,
			appName,
            navigationBar,
            clientTheme,
            pushAppRecordManifestData.sys_id
        );
        var oauthEntityManifestData = this.getOrCreateOAuthEntityRecord(appType);

        var records = {
            sys_sg_native_client: nativeClientRecordManifestData,
            sys_sg_mobile_application: mobileAppRecordManifestData,
            oauth_entity: oauthEntityManifestData,
            sys_push_application: pushAppRecordManifestData,
        };

        /*var updateSetName = "Mobile App Type: " + appType;
        var updateSetDescription =
          "This update set contains the records to define the mobile app type: " +
          appType +
          ". This update set was generated automatically by the Mobile Publishing scoped application and can be used to move this type across instances";
        this.createUpdateSet(updateSetName, updateSetDescription, records);*/

        var result = JSON.stringify(records);
        gs.info("inserted records" + result);

        return JSON.stringify(records);
    },
    generateAllRecords: function(queryParams) {
        var appName = queryParams.app_name[0];
        var appType = queryParams.app_type[0];
        var clientTheme = queryParams.client_theme[0];
        var navigationBar = queryParams.navigation_bar[0];

        // Todo: Input validation
        // TODO: ability to delete all records created
        var result = this.createMobileAppRecords(
            appName,
            appType,
            navigationBar,
            clientTheme
        );

        return result;
    },
    type: 'crossScopeCustomRecordsService'
};
