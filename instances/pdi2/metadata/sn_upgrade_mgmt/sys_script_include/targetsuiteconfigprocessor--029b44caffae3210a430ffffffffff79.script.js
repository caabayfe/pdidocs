var TargetSuiteConfigProcessor = Class.create();
TargetSuiteConfigProcessor.prototype = {
    initialize: function() {
        this.json = new global.JSON();
    },

    /**
     * Main processing method that fetches and stores suite configs
     * Called by the background worker
     * @param {string} platformNumber - The platform number to fetch suite configs for
     */
    processSuiteConfigs: function(platformNumber) {
        try {
            gs.info("TargetSuiteConfigProcessor: Starting to fetch suite configs for platform: " + platformNumber);
            
            // Call the upgrade management utility to get suite versions
            var result = new sn_uc.UpgradeMgmtUtil.getSuiteVersions(platformNumber);
            
            if (!result) {
                gs.error("TargetSuiteConfigProcessor: No result returned from getSuiteVersions for platform: " + platformNumber);
                return;
            }
            
            // Process and insert suite configs
            this._processSuiteData(result, platformNumber);
            
            gs.info("TargetSuiteConfigProcessor: Successfully completed processing for platform: " + platformNumber);
            
        } catch (err) {
            gs.error("TargetSuiteConfigProcessor: Error processing suite configs for platform " + platformNumber + ": " + err.message);
            throw err;
        }
    },

    /**
     * Processes suite data and inserts into database tables
     * @param {Object} suiteData - The suite data from upgrade management utility
     * @param {string} platformNumber - The platform number
     */
    _processSuiteData: function(suiteData, platformNumber) {
        if (!suiteData || !suiteData.suiteConfigs) {
            gs.error("TargetSuiteConfigProcessor: Invalid suite data received");
            return;
        }
        
        // Parse suiteConfigs JSON string and extract configs array
        var suiteConfigsObj = this.json.decode(suiteData.suiteConfigs);
        
        if (!suiteConfigsObj || !suiteConfigsObj.result || !suiteConfigsObj.result.configs) {
            gs.error("TargetSuiteConfigProcessor: Invalid suite configs structure");
            return;
        }
        
        var configs = suiteConfigsObj.result.configs;
        var insertedCount = 0;
        var skippedCount = 0;
        
        for (var i = 0; i < configs.length; i++) {
            var config = configs[i];
            
            // Check if suite config already exists
            if (this._suiteConfigExists(platformNumber, config.version)) {
                skippedCount++;
                continue;
            }
            
            // Insert suite config
            var suiteConfigSysId = this._insertSuiteConfig(config, platformNumber);
            
            if (suiteConfigSysId) {
                this._insertSuiteConfigApps(suiteConfigSysId, config.applications);
                insertedCount++;
            }
        }
        
        gs.info("TargetSuiteConfigProcessor: Processing complete for platform " + platformNumber + 
                ". Inserted: " + insertedCount + ", Skipped: " + skippedCount + ", Total: " + configs.length);
    },

    /**
     * Checks if a suite config already exists
     * @param {string} platform - Platform version
     * @param {string} version - Suite version
     * @returns {boolean} - True if exists, false otherwise
     */
    _suiteConfigExists: function(platform, version) {
        var gr = new GlideRecord("sn_um_incoming_suite_config");
        gr.addQuery("platform", platform);
        gr.addQuery("version", version);
        gr.query();
        return gr.hasNext();
    },

    /**
     * Inserts a suite config record
     * @param {Object} config - Suite config data
     * @param {string} platformNumber - Platform number
     * @returns {string} - sys_id of inserted record or null
     */
    _insertSuiteConfig: function(config, platformNumber) {
        var gr = new GlideRecord("sn_um_incoming_suite_config");
        gr.initialize();
        gr.setValue("name", config.name);
        gr.setValue("version", config.version);
        gr.setValue("platform", platformNumber);
        gr.setValue("type", config.type);
        gr.setValue("installed", false);
        gr.setValue("compatible", false);
        
        var sysId = gr.insert();
        
        if (!sysId) {
            gs.error("TargetSuiteConfigProcessor: Failed to insert suite config - " + config.name + " v" + config.version);
        }
        
        return sysId;
    },

    /**
     * Inserts suite config application mappings
     * @param {string} suiteConfigSysId - sys_id of the suite config
     * @param {Array} applications - Array of application objects
     */
    _insertSuiteConfigApps: function(suiteConfigSysId, applications) {
        if (!applications || applications.length === 0) {
            return;
        }
        
        var failedCount = 0;
        
        for (var i = 0; i < applications.length; i++) {
            var app = applications[i];
            
            var appGr = new GlideRecord("sn_um_incoming_suite_config_app_version_m2m");
            appGr.initialize();
            appGr.setValue("suite_config", suiteConfigSysId);
            appGr.setValue("app_scope", app.scope_name);
            appGr.setValue("app_version", app.version);
            
            var sysId = appGr.insert();
            
            if (!sysId) {
                gs.error("TargetSuiteConfigProcessor: Failed to insert app: " + app.scope_name + "@" + app.version);
                failedCount++;
            }
        }
        
        if (failedCount > 0) {
            gs.warn("TargetSuiteConfigProcessor: " + failedCount + " out of " + applications.length + " applications failed to insert");
        }
    },

    type: 'TargetSuiteConfigProcessor'
};
