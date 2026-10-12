var WWNAConfigImpl = Class.create();
WWNAConfigImpl.prototype = {
    initialize: function(table, sysId, skillId) {
        this.table = table;
        this.sysId = sysId;
        this.skillId = skillId;
        this.logger = new sn_wwna.WWNALogger();

        var extensions = new GlideScriptedExtensionPoint().getExtensions("sn_wwna.WWNAConfig");

        try {
            for (var j = 0; j < extensions.length; j++) {
                if (extensions[j].isValid(table, sysId, skillId)) {
                    this.extension = extensions[j];
                    break;
                }
            }
        } catch (ex) {
            this.logger.warn("Exception while executing WWNA extension point: " + ex);
        }
    },

    getFilters: function() {
        if (!this.extension) {
            if (this.skillId === sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID && this.table) {
                return {
                    table: this.table
                };
            }

            return;
        }
        var skillFilter = this.extension.getFilters(this.table, this.sysId, this.skillId);
        return skillFilter;
    },

    getAdditionalConfig: function(skillConfig) {
        var additionalConfig = {};
        try {
            additionalConfig = this.extension.getAdditionalConfig(this.table, this.sysId, this.skillId, skillConfig);
        } catch (ex) {
            this.logger.warn("Exception while executing getAdditionalConfig from extension point: " + ex);
        }

        return additionalConfig;
    },

    getSkillConfigObj: function() {
        try {
            var configObj = this.extension.getSkillConfigObj(this.table, this.sysId, this.skillId);
            return configObj;
        } catch (ex) {
            this.logger.warn("Exception while executing getSkillConfigObj from extension point: " + ex);
            return {
                isErrored: true
            };
        }
    },

    isWWNAActive: function(skillConfig) {
        var isWWNAActive = true;
        try {
            isWWNAActive = this.extension.isWWNAActive(this.table, this.sysId, this.skillId, skillConfig);
        } catch (ex) {
            this.logger.warn("Exception while executing isWWNAActive from extension point: " + ex);
        }

        return isWWNAActive;
    },

    getSkillContext: function(payload) {
        try {
            var newContext = {};
            var skillContext = this.extension.getContext(this.table, this.sysId, this.skillId, payload);
            if (!skillContext?.context) {
                newContext.isGenericError = skillContext ? false : true;
                newContext.context = skillContext;

                return newContext;
            }
            return skillContext;
        } catch (ex) {
            this.logger.warn("Exception while executing getContext from extension point: " + ex);
            return {
                context: "",
                isGenericError: true
            };
        }
    },

    getGroupId: function() {
        try {
            return this.extension.getGroupId(this.table, this.sysId, this.skillId);
        } catch (ex) {
            this.logger.warn("Exception while executing getGroupId from extension point: " + ex);
            return "";
        }
    },

    isNowLLM: function(modelProvider) {
        return modelProvider == WWNAConstants.MODEL_PROVIDERS.NOW_LLM;
    },

    appendModelOutput: function(outputs) {
        if (!outputs || !outputs.response) return;
        outputs.response = JSON.stringify({
            model_output: outputs.response
        });
    },

    preProcessInputs: function(inputs, modelProvider = "") {
        try {
            return this.extension.preProcessInputs(this.table, this.sysId, this.skillId, inputs, modelProvider);
        } catch (ex) {
            this.logger.warn("Exception while executing preProcessInputs from extension point: " + ex);
            if (inputs.isOpenPromptRequest) {
                // this is to save token count space
                if (inputs.drafted_text === inputs.selected_text) {
                    inputs.selected_text = '';
                }
            } else {
                inputs.drafted_text = inputs.drafted_text.replace(inputs.selected_text, `###${inputs.selected_text}###`);
            }
            return inputs;
        }
    },

    postProcessOutputs: function(outputs, modelProvider = "") {
        const utils = new sn_wwna.WWNAUtils();
        var errorMessage = utils.nacmGuardianErrorHandler(outputs.result);
        if (errorMessage) {
            outputs.result.response = errorMessage;
        }
        var additionalDataToBeAdded = {};
        var shouldCallExtension = true;
        try {
            if (outputs.result?.response && !errorMessage) {
                if (!this.isNowLLM(modelProvider)) {
                    this.appendModelOutput(outputs.result);
                }
                let parsedResponse = JSON.parse(outputs.result.response);
                let parsedModelOutput;
                try {
                    const modelOutput = parsedResponse.model_output;
                    parsedModelOutput = typeof modelOutput === 'string' ?
                        JSON.parse(modelOutput) :
                        (modelOutput || {});
                } catch (error) {
                    if (error.message?.includes("Unterminated string literal")) {
                        outputs.result.response = sn_wwna.WWNAConstants.WWNA_MODAL_OUTPUT_PARSING_ERROR_RESPONSE_MESSGAE;
                    }
                    return outputs;
                }
                let keys = Object.keys(parsedModelOutput);
                if (keys.length > 1) {
                    keys.forEach((key) => {
                        if (key !== 'response') {
                            additionalDataToBeAdded[key] = parsedModelOutput[key];
                            if (key === 'isMoreInformationRequired' && additionalDataToBeAdded[key]) {
                                additionalDataToBeAdded['subState'] = sn_wwna.WWNAConstants.ONE_EXTEND_SUB_STATES.NEEDS_MORE_INFORMATION;
                            }
                        }
                    });
                }
            }
            if (outputs.requestPayload?.action === sn_wwna.WWNAConstants.NACM_OPEN_PROMPT_ACTION) {
                shouldCallExtension = false;
            }
            var updatedOutput;
            if (shouldCallExtension) {
                updatedOutput = this.extension.postProcessOutputs(this.table, this.sysId, this.skillId, outputs, modelProvider);
                if (updatedOutput?.result) {
                    updatedOutput.result = Object.assign(updatedOutput.result, additionalDataToBeAdded);
                }
            } else {
                updatedOutput = utils.formatCapabilityResponse(outputs, additionalDataToBeAdded);
            }
            return updatedOutput;
        } catch (ex) {
            this.logger.warn("Exception while executing postProcessOutputs from extension point: " + ex);

            if (outputs.result?.response && !errorMessage) {
                try {
                    outputs = utils.formatCapabilityResponse(outputs, additionalDataToBeAdded);
                } catch (err) {
                    this.logger.warn("Exception while executing postProcessOutputs from extension point catch block: " + err);

                    outputs.result.response = sn_wwna.WWNAConstants.GENERIC_ERROR_MESSAGE;
                }
            }
            return outputs;
        }
    },

    additionalAnalyticsData: function(additionalDataStringifiedObject) {
        try {
            return this.extension.additionalAnalyticsData(this.table, this.sysId, this.skillId, additionalDataStringifiedObject);
        } catch (ex) {
            this.logger.warn("Exception while executing additionalData from extension point: " + ex);
            return "";
        }
    },

    preValidateInputs: function(selected_text, drafted_text) {
        try {
            return this.extension.preValidateInputs(this.table, this.sysId, this.skillId, selected_text, drafted_text);
        } catch (ex) {
            this.logger.warn("Exception while executing preValidateInputs from extension point: " + ex);
            if (!selected_text || selected_text.trim() === "") {
                gs.publish(ambChannelName, {
                    "status": sn_wwna.WWNAConstants.ONE_EXTEND_STATES.ERROR,
                    "errorMessage": sn_wwna.WWNAConstants.SELECTED_TEXT_EMPTY
                });
                return {
                    isValid: false,
                    errorMessage: sn_wwna.WWNAConstants.SELECTED_TEXT_EMPTY,
                    errorType: "warning",
                    skipErrorMessage: true
                };
            } else {
                return {
                    isValid: true
                };
            }
        }
    },

    addTruncation: function(payload, attrsWithTruncationEnabled, provider, remainingTokens) {
        try {
            return this.extension.addTruncation(this.table, this.sysId, this.skillId, payload, attrsWithTruncationEnabled, provider, remainingTokens);
        } catch (ex) {
            this.logger.warn("Exception while executing addTruncation from extension point: " + ex);
            return payload;
        }
    },

    getPromptConfigFilters: function(actionCommandName) {
        try {
            return this.extension.getPromptConfigFilters(this.table, this.sysId, this.skillId, actionCommandName);
        } catch (ex) {
            this.logger.warn("Exception while executing getPromptConfigFilters from extension point: " + ex);
            return null;
        }
    },

    getTargetLanguage: function() {
        try {
            return this.extension.getTargetLanguage(this.table, this.sysId, this.skillId);
        } catch (ex) {
            this.logger.warn("Exception while executing getTargetLanguage from extension point: " + ex);
            return null;
        }
    },

    getDomainGr: function() {
        try {
            return this.extension.getDomainGr(this.table, this.sysId, this.skillId);
        } catch (ex) {
            this.logger.warn("Exception while executing getDomainGr from extension point: " + ex);
            return null;
        }
    },
    shouldDisableMerge: function() {
        let result = true;
        try {
            if (this.skillId === sn_wwna.WWNAConstants.WWNA_COMMON_ACTIONS_CAPABILITY_ID) {
                result = false;
            }
            if (this.extension && this.extension.shouldDisableMerge) {
                result = this.extension.shouldDisableMerge(this.table, this.sysId, this.skillId);
            }
            return result;
        } catch (err) {
            this.logger.warn("Exception while executing shouldDisableMerge from extension point: " + err?.message);
            return result;
        }
    },
    type: 'WWNAConfigImpl'
};
