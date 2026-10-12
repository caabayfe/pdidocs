var GuidedSetupSubmitSurvey = Class.create();
GuidedSetupSubmitSurvey.prototype = {
    GSW_CHANGE_LOG_TABLE: 'gsw_change_log',
    SURVEY_CONTENT_ID: 'b33b17dc1b925410e5dcea08bc4bcbf9', // Let's set up your Conversational Experience! 
    SURVEY_PARENT_CONTENT_ID: 'e2da53dc1b925410e5dcea08bc4bcb70', // Personalize your setup experience

    initialize: function() {},

    getSelectedSurveyOptions: function() {
        var selected = JSON.parse(gs.getUser().getPreference("save_survey_options"));
        var setup_type = gs.getUser().getPreference("setup_type");
        var result = {
            'selected': selected,
            'setup_type': setup_type
        };

        return result;
    },

    saveSurvey: function(guidedSetupId, selectedOptions, setupType) {

        this._saveSelectedSurveyOptions(selectedOptions, setupType); //Save last selected survey options

        var result = this._getResponseResult(selectedOptions);
        result['setup_type'] = [];
        result['setup_type'].push(setupType);
        if (result) {
            this._insertResponseRecords(guidedSetupId, result);
            this._markSurveyStepAsComplete();
        } else
            return {
                "status": "Response records not inserted"
            };
    },

    _markSurveyStepAsComplete: function() {
        var contentIds = [this.SURVEY_CONTENT_ID, this.SURVEY_PARENT_CONTENT_ID];
        var gr = new GlideRecord(this.GSW_CHANGE_LOG_TABLE);
        contentIds.forEach(function(contentId) {
            gr.initialize();
            gr.content = contentId;
            gr.type = 2; //Status-Completed
            gr.insert();
        });
    },

    _getResponseResult: function(selectedOptions) {
        var result = {};
        var basic_entitlement_subscription = [];
        var basic_agent_subscription = [];
        var entitlement = [];
        var agentsupport = [];

        selectedOptions.forEach(function(entitlementValue) {

            var entitlementArr = entitlementValue.split("_");

            if (entitlementArr.indexOf("PRO") > -1) {
                if (basic_entitlement_subscription.indexOf("PRO") == -1)
                    basic_entitlement_subscription.push("PRO");

                if (entitlementArr.indexOf("LA") > -1) {
                    if (basic_agent_subscription.indexOf("PRO_LA") == -1)
                        basic_agent_subscription.push("PRO_LA");
                } else {
                    if (basic_agent_subscription.indexOf("PRO_VA") == -1)
                        basic_agent_subscription.push("PRO_VA");
                }

                if (entitlementArr.indexOf("LA") == -1) {
                    entitlement.push(entitlementValue);
                    agentsupport.push(entitlementArr[0] + "_VA");
                }
            } else if (entitlementArr.indexOf("STANDARD") > -1) {
                if (basic_entitlement_subscription.indexOf("STANDARD") == -1)
                    basic_entitlement_subscription.push("STANDARD");

                if (entitlementArr.indexOf("LA") > -1) {
                    if (basic_agent_subscription.indexOf("STANDARD_LA") == -1)
                        basic_agent_subscription.push("STANDARD_LA");
                } else {
                    if (basic_agent_subscription.indexOf("STANDARD_VA") == -1)
                        basic_agent_subscription.push("STANDARD_VA");
                }

                if (entitlementArr.indexOf("LA") == -1) {
                    entitlement.push(entitlementValue);
                    agentsupport.push(entitlementArr[0] + "_VA");
                }
            }
        });

        if (basic_entitlement_subscription.indexOf("PRO") > -1 && basic_entitlement_subscription.indexOf("STANDARD") > -1) {
            basic_entitlement_subscription = basic_entitlement_subscription.filter(function(item) {
                return item !== "STANDARD";
            });
        }

        if (basic_agent_subscription.indexOf("PRO_VA") > -1 && basic_agent_subscription.indexOf("STANDARD_VA") > -1) {
            basic_agent_subscription = basic_agent_subscription.filter(function(item) {
                return item !== "STANDARD_VA";
            });
        }

        if (basic_entitlement_subscription.indexOf("PRO") > -1 && basic_agent_subscription.indexOf("STANDARD_LA") > -1) {
            basic_agent_subscription.push("PRO_LA");
            basic_agent_subscription = basic_agent_subscription.filter(function(item) {
                return item !== "STANDARD_LA";
            });
        }

        result["entitlement"] = entitlement;
        result["agentsupport"] = agentsupport;
        result["basic_agent_subscription"] = basic_agent_subscription;
        result["basic_entitlement_subscription"] = basic_entitlement_subscription;

        return result;
    },

    _insertResponseRecords: function(guidedSetupId, result) {
        try {
            if (result && Object.keys(result).length > 0) {
                var configSetupId = '';

                var configGr = new GlideRecord("guided_setup_configuration");
                configGr.addQuery('parent_guided_setup', guidedSetupId);
                configGr.query();
                if (configGr.next())
                    configSetupId = configGr.getUniqueValue();

                var gr = new GlideRecord("guided_setup_configuration_response");
                gr.addQuery("parent_setup_config", configSetupId);
                gr.setValue("active", false);
                gr.updateMultiple();

                for (var variableName in result) {
                    if (result[variableName] && result[variableName].length > 0) {
                        for (var variableValueIndx in result[variableName]) {
                            var variableValue = result[variableName][variableValueIndx];
                            gr = new GlideRecord("guided_setup_configuration_response");
                            gr.initialize();
                            gr.setValue("parent_setup_config", configSetupId);
                            gr.setValue("category", variableName);
                            gr.setValue("value", variableValue);
                            gr.setValue("active", true);
                            gr.insert();
                        }
                    }
                }
            }
            return {
                "status": "Success"
            };
        } catch (err) {
            return {
                "status": "Error " + err
            };
        }
    },

    _saveSelectedSurveyOptions: function(selectedOptions, setupType) {
        gs.getUser().savePreference("save_survey_options", JSON.stringify(selectedOptions));
        gs.getUser().savePreference("setup_type", setupType);
    },

    type: 'GuidedSetupSubmitSurvey'
};
