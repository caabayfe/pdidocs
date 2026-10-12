var VSCComplianceUtil = Class.create();
VSCComplianceUtil.prototype = {
    initialize: function() {},
    /**
     * Check if property value matches with the currentVal being passed as function parameter and update compliance state of configuration respectively.
     *
     * @param {string} propertyName - The property name of the configuration
     * @param {string} recValue - Recommended value for configuration
     * @param {string} defaultValue - Default value for configuration
     */
    evaluateCompliance: function(propertyName, recValue, defaultValue) {
        var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
        var propVal = gs.getProperty(propertyName) || defaultValue;
        grConfig.get('config_name', propertyName);
        if (propVal.toLowerCase().toString() == recValue.toLowerCase().toString()) {
            grConfig.config_configure = true;
        } else {
            grConfig.config_configure = false;
        }

        // Fetch current property value and set to defaultValue if property has not been set yet
        grConfig.config_current_value = propVal;
        var settingArr = grConfig.config_setting.split(","); //Each dependency can belong to multiple configurations
        grConfig.update();
        this.updateSettingCompliance(settingArr);
    },

    /**
     *Evaluate criteria in configuration groups and set compliance state of configuration whenever configuration is updated.
     *
     *@param {List} settingArr - List of all settings that configuration belongs to
     */
    updateSettingCompliance: function(settingArr) {
        var grSetting = new GlideRecord('sn_vsc_instance_hardening_settings');
        for (var i = 0; i < settingArr.length; i++) {
            var compliant = false;
            var grp = new GlideRecord('sn_vsc_security_configuration_groups');
            grp.addQuery('grp_setting', settingArr[i]);
            grp.query();
            while (grp.next() && !compliant) { //For each group within configuration
                var configs = grp.grp_list.split(",");
                var encodedQuery = "config_configure=true^sys_id=" + configs.join("^ORsys_id=");
                var gr = new GlideRecord('sn_vsc_security_check_configurations');
                gr.addEncodedQuery(encodedQuery);
                gr.query();
                compliant = configs.length === gr.getRowCount();
            }
            grSetting.get(settingArr[i]);
            grSetting.compliance_status = compliant ? 'compliant' : 'non-compliant'; //If any group has all configurations as compliant, then set setting as compliant
            grSetting.update();
        }
    },

    /**
     * Check if property exists and not contain empty value.
     *
     * @param {string} propertyName Name of system property
     */
    checkNotNill: function(propertyName) {
        var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
        grConfig.get('config_name', propertyName);
        if (!gs.nil(gs.getProperty(propertyName))) {
            grConfig.config_configure = true;
        } else {
            grConfig.config_configure = false;
        }
        grConfig.config_current_value = gs.getProperty(propertyName);
        var settingArr = grConfig.config_setting.split(","); //Each configuration can belong to multiple settings
        grConfig.update();
        this.updateSettingCompliance(settingArr);
    },

    /**
     *Check if Plugin is active and registered
     *
     *@param {string} pluginName Name of plugin.
     */
    checkPlugin: function(pluginName) {
        var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
        grConfig.get('config_name', pluginName);
        if (GlidePluginManager.isActive(pluginName)) {
            grConfig.config_configure = true;
        } else {
            grConfig.config_configure = false;
        }
        var settingArr = grConfig.config_setting.split(","); //Each configuration can belong to multiple settings
        grConfig.update();
        this.updateSettingCompliance(settingArr);
    },

    /**
     * Execute all records from Security Check Configurations table, update the compliance state of configurations respectively.
     */
    runComplianceCheck: function() {
        var evaluator = new GlideScopedEvaluator();
        var grSetting = new GlideRecord('sn_vsc_instance_hardening_settings');
        grSetting.query();
        while (grSetting.next()) {
            var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
            grConfig.addQuery('config_setting', 'CONTAINS', grSetting.sys_id);
            grConfig.query();
            while (grConfig.next()) {
                var settingArr = grConfig.config_setting.split(","); //Each configuration can belong to multiple settings
                evaluator.evaluateScript(grConfig, 'config_evaluation_script', null);
                this.updateSettingCompliance(settingArr);
            }
        }
    },

    /**
     * Update the compliance state of given setting.
     */
    runSettingComplianceCheck: function(harcId) {
        var evaluator = new GlideScopedEvaluator();
        var grSetting = new GlideRecord('sn_vsc_instance_hardening_settings');
        grSetting.addQuery('sys_id', harcId);
        grSetting.query();
        if (grSetting.next()) {
            var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
            grConfig.addQuery('config_setting', 'CONTAINS', grSetting.sys_id);
            grConfig.query();
            while (grConfig.next()) {
                var settingArr = grConfig.config_setting.split(","); //Each configuration can belong to multiple settings
                evaluator.evaluateScript(grConfig, 'config_evaluation_script', null);
                this.updateSettingCompliance(settingArr);
            }
        }
    },

    /**
     *Update current value of configurations with user defined value on UI
     *
     *@param {object} responses Array of objects containing dependency name and its value.
     */
    activateConfigurations: function(responses, triggerPaJob) {
        var result = '';
        var evaluator = new GlideScopedEvaluator();
        var harcSettings = new GlideRecord("sn_vsc_instance_hardening_settings");
        harcSettings.addQuery("compliance_status", "compliant");
        harcSettings.query();
        var compliantSettingsCountBefore = harcSettings.getRowCount();
        for (var obj in responses) {
            var gr_dep = new GlideRecord('sn_vsc_security_check_configurations');
            gr_dep.addEncodedQuery('config_name=' + GlideStringUtil.escapeQueryTermSeparator(obj) + '^config_link=NULL', true);
            gr_dep.query();
            if (gr_dep.next()) {
                var vars = {
                    'userInput': responses[obj]
                };
                result = evaluator.evaluateScript(gr_dep, 'config_remediation_script', vars);
            }
        }

        if (triggerPaJob) {
            harcSettings.addQuery("compliance_status", "compliant");
            harcSettings.query();
            var compliantSettingsCountAfter = harcSettings.getRowCount();
            if (compliantSettingsCountAfter !== compliantSettingsCountBefore)
                this.executeJob(new sn_vsc.SecurityCenterConstants().SCPAJob);
        }

        return result;
    },

    /**
     * Execute a PA job
     * 
     */
    executeJob: function(paJobSysId) {
        var vsc_pa_job = new GlideRecord('sysauto_pa');
        if (vsc_pa_job.get(paJobSysId)) {
            gs.executeNow(vsc_pa_job);
        }
    },

    /**
     *Update compliance state of plugins and tabular configs
     *
     *@param {setting} sysId of settings
     */
    activateSpecialConfigs: function(setting) {
        var evaluator = new GlideScopedEvaluator();
        var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
        grConfig.addEncodedQuery('config_setting=' + GlideStringUtil.escapeQueryTermSeparator(setting) + '^config_link!=NULL', true);
        grConfig.query();
        while (grConfig.next()) {
            evaluator.evaluateScript(grConfig, 'config_remediation_script');
        }
    },
    /**
     * Check if property value matches with the default value being passed as function parameter and update compliance state of configuration respectively.
     *
     * @param {string} propertyName - The property name of the configuration
     * @param {string} recValue - Recommended value for configuration
     * @param {string} defaultValue - Default value for configuration
     */
    evaluateTextValues: function(propertyName, recValue, defaultValue) {
        var complianceState = true;
        var recValues = recValue.split(",");
        // set defaut value if the property does not exist
        var sysPropertyVal = gs.getProperty(propertyName);
        if (sysPropertyVal == null) {
            sysPropertyVal = defaultValue;
        }
        propValues = sysPropertyVal.split(",");
        var grConfig = new GlideRecord("sn_vsc_security_check_configurations");
        grConfig.get("config_name", propertyName);
        if (recValues.length != propValues.length) {
            complianceState = false;
        } else {
            for (var i in propValues) {
                if (recValues.indexOf(propValues[i].trim()) == -1) {
                    complianceState = false;
                    break;
                }
            }
        }
        grConfig.config_current_value = sysPropertyVal;
        grConfig.config_configure = complianceState;
        grConfig.update();
        var settingArr = grConfig.config_setting.split(","); //Each dependency can belong to multiple configurations
        this.updateSettingCompliance(settingArr); // updated related Hardening setting state
    },

    /***
     * Check if the property value is set with recommended integer value, and mark the compliance state of the configuration
     * @param {string} configName - configuration name 
     * @param {string} propertyName - property name 
     * @param {integer} recVal - recommended value
     * @param {integer} defaultVal - default value
     * @param {string} condition - condition to be evaluated
     */
    evaluateConditionalValue: function(configName, propertyName, recVal, defaultVal, condition) {
        var propVal = gs.getProperty(propertyName, defaultVal);
        var res = false;
        if (!isNaN(propVal)) {
            if (condition == '>=') {
                res = propVal >= recVal ? true : false;
            } else if (condition == '<=') {
                res = propVal <= recVal ? true : false;
            } else if (condition == '==') {
                res = propVal == recVal ? true : false;
            } else if (condition == '!=') {
                res = propVal != recVal ? true : false;
            } else if (condition == '<') {
                res = propVal < recVal ? true : false;
            } else if (condition == '>') {
                res = propVal > recVal ? true : false;
            }
        }

        var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
        grConfig.get('config_name', configName);
        grConfig.config_configure = res;
        grConfig.config_current_value = propVal;
        grConfig.update();

        // update related hardening settings
        var settingArr = grConfig.config_setting.split(",");
        new sn_vsc.VSCComplianceUtil().updateSettingCompliance(settingArr);
    },

    updateComplianceStatusLookUp: function(harcId, complianceStatus) {
        var grComplianceStatus = new GlideRecord('sn_vsc_harc_compliance_status_lookup');
        // update the status, if the setting already exists
        if (grComplianceStatus.get('harc_setting', harcId)) {
            grComplianceStatus.harc_compliance_status = complianceStatus;
            grComplianceStatus.update();
        } else {
            //create a new entry for the new setting
            grComplianceStatus.initialize();
            grComplianceStatus.harc_compliance_status = complianceStatus;
            grComplianceStatus.harc_setting = harcId;
            grComplianceStatus.insert();
        }
    },

    //Insert into updated_settings table for new settings introduced
    updateSettingsInsert: function(harcId, complianceStatus) {
        var upSetting = new GlideRecord("sn_vsc_updated_settings");
        if (!upSetting.get('u_setting', harcId)) {
            upSetting.initialize();
            upSetting.u_compliance_state = complianceStatus;
            upSetting.u_setting = harcId;
            upSetting.insert();
        }
    },

    getCurrentReleaseVersion: function() {
        var buildTag = gs.getProperty('glide.buildtag');
        var releaseLetter = "";
        if (buildTag != null) {
            releaseLetter = buildTag.charAt(6);
        }
        return releaseLetter;
    },
    /**
     * There are some configurations that needs to be validated only in the introduced version or higher.
     * For such config , mark the config as compliant if the instance is on version prior to introduced version.
     */
    setConfigCompliantByDefault: function(propName, configName, defaultVal) {
        var propVal = gs.getProperty(propName, defaultVal);
        var grConfig = new GlideRecord('sn_vsc_security_check_configurations');
        grConfig.get('config_name', configName);
        grConfig.config_configure = true;
        grConfig.config_current_value = propVal;
        grConfig.update();
        // update related hardening settings
        var settingArr = grConfig.config_setting.split(",");
        new sn_vsc.VSCComplianceUtil().updateSettingCompliance(settingArr);
    },
    checkIfConfigNeedValidation: function(introducedVersion) {
        var requireValidation = false;
        var releaseLetter = "";
        var releaseYear;
        var relevantReleaseLetters = ['u', 'v', 'w', 'x', 'y', 'z'];
        var introVersionIdx = relevantReleaseLetters.indexOf(introducedVersion);
        if (introVersionIdx >= 0) {
            var buildTag = gs.getProperty('glide.buildtag');
            if (buildTag != null) {
                releaseLetter = buildTag.charAt(6);
                var safeDate = 2024;
                releaseYear = buildTag.split("-")[7];
                if (buildTag.includes("hotfix")) {
                    releaseYear = buildTag.split("-")[8];
                }
                if ((relevantReleaseLetters.indexOf(releaseLetter) >= introVersionIdx) || releaseYear >= safeDate) {
                    requireValidation = true;
                }
            }
        }
        return requireValidation;
    },
    type: 'VSCComplianceUtil'
};
