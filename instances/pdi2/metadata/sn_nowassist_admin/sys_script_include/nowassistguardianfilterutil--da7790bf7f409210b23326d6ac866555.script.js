var NowAssistGuardianFilterUtil = Class.create();
NowAssistGuardianFilterUtil.prototype = {
    initialize: function(blockContext, pageParams) {
        this.BLOCK_CONTEXT = blockContext;
        this.PAGE_PARAMS = pageParams;
        this.GEN_AI_FILTER = 'sys_gen_ai_filter';
        this.GEN_AI_SAMPLE_PHRASES = 'sys_gen_ai_filter_sample';
        this.VA_DEPLOYMENT_CHANNEL = 'sys_now_assist_deployment';
        this.VA_DEPLOYMENT_CONFIG = 'sys_now_assist_deployment_config';
        this.GEN_AI_FILTER_CONFIG = 'sys_gen_ai_filter_config';
        this.CS_TOPIC = 'sys_cs_topic';
        this.NAA_GLOBAL_SCOPED_UTIL = new global.NowAssistAdminGlobalScopedUtil();
        this.ONE_EXTEND_GLIDE_UTIL = new global.OneExtendGlideUtil();
    },
    getGenAIFilters: function() {
        try {
            var result = [];
            var genAIFilterGr = new GlideRecord(this.GEN_AI_FILTER);
            genAIFilterGr.addQuery("filter_type", "Sensitive");
            genAIFilterGr.query();
            while (genAIFilterGr.next()) {
                var filterObject = {};

                filterObject.name = genAIFilterGr.getValue('filter_name');
                filterObject.description = genAIFilterGr.getDisplayValue('description');
                filterObject.isActive = genAIFilterGr.getValue('active') === "1" ? true : false;
                filterObject.filterGroup = genAIFilterGr.getDisplayValue('filter_group');
                filterObject.filterGroupOrder = genAIFilterGr.getValue('filter_group_order');
                filterObject.filterId = genAIFilterGr.getValue('sys_id');
                filterObject.filterErrorTopicId = genAIFilterGr.getValue('filter_error_topic');
                filterObject.filterErrorTopic = genAIFilterGr.getDisplayValue('filter_error_topic');
                filterObject.lastUpdatedOn = genAIFilterGr.getDisplayValue('sys_updated_on');
                filterObject.product = genAIFilterGr.getDisplayValue('business_unit');
                filterObject.filterType = genAIFilterGr.getDisplayValue('filter_type');
                filterObject.filterConfigurations = genAIFilterGr.getValue('filter_configurations');

                result.push(filterObject);
            }
            return result;
        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch genAIFilters" + e.toString());
            return [];
        }


    },
    getGenAIFilterByFilterId: function(filterId) {

        try {
            if (gs.nil(filterId)) {
                return null;
            }
            var result = {};

            var genAIFilterGr = new GlideRecord(this.GEN_AI_FILTER);
            var filter = genAIFilterGr.get(filterId);
            if (filter) {
                result.name = genAIFilterGr.getValue('filter_name');
                result.description = genAIFilterGr.getValue('description');
                result.isActive = genAIFilterGr.getValue('active') === "1" ? true : false;
                result.filterGroup = genAIFilterGr.getDisplayValue('filter_group');
                result.filterGroupOrder = genAIFilterGr.getValue('filter_group_order');
                result.filterId = genAIFilterGr.getValue('sys_id');
                result.filterErrorTopicId = genAIFilterGr.getValue('filter_error_topic');
                result.filterErrorTopic = genAIFilterGr.getDisplayValue('filter_error_topic');
                result.createdOn = genAIFilterGr.getValue('sys_created_on');
                result.product = genAIFilterGr.getDisplayValue('business_unit');
                result.filterType = genAIFilterGr.getValue('filter_type');
                result.filterConfigurations = genAIFilterGr.getValue('filter_configurations');
            }
            return result;
        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch genAIFilterByFilterId" + e.toString());
            return null;
        }

    },
    getIsAssistantActive: function(assistantId, filterId) {
        var vaContextProfile;
        try {
            var naDeploymentConfigGr = new GlideRecord(this.VA_DEPLOYMENT_CONFIG);
            var naDeploymentConfigRecord = naDeploymentConfigGr.get('now_assist_deployment', assistantId);

            if (naDeploymentConfigRecord) {
                vaContextProfile = naDeploymentConfigGr.getValue('context_profile');

                var genAiFilterConfigGr = new GlideRecord(this.GEN_AI_FILTER_CONFIG);
                genAiFilterConfigGr.addQuery('filter', filterId);
                genAiFilterConfigGr.addQuery('document_id', vaContextProfile);
                genAiFilterConfigGr.query();

                if (genAiFilterConfigGr.next()) {
                    var isActiveVA = genAiFilterConfigGr.getValue('active') === "1" ? true : false;
                    if (isActiveVA) {
                        return {
                            active: true,
                            contextProfile: vaContextProfile
                        };
                    }

                }
            }

        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch active Virtual Assistant" + e.toString());
        }
        return {
            active: false,
            contextProfile: vaContextProfile
        };

    },
    getVADeploymentChannels: function(filterId) {
        try {
            var result = [];
            var deploymentChannelGr = new GlideRecord(this.VA_DEPLOYMENT_CHANNEL);
            deploymentChannelGr.addQuery('active', true);
            deploymentChannelGr.orderBy("sys_created_on");
            deploymentChannelGr.query();
            while (deploymentChannelGr.next()) {
                var assistantId = deploymentChannelGr.getValue('sys_id');
                var assistantDetails = this.getIsAssistantActive(assistantId, filterId);
                result.push({
                    vaName: deploymentChannelGr.getValue('name'),
                    sysId: assistantId,
                    assistantDocumnetId: assistantDetails.contextProfile,
                    isActive: assistantDetails.active
                });
            }

            return result;
        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch VA Assistants" + e.toString());
            return [];
        }
    },
    getActiveVADeploymentChannels: function(filterId) {
        try {
            var activeVa = "";
            var activeVaCount = 0;
            var genAiFilterConfigGr = new GlideRecord(this.GEN_AI_FILTER_CONFIG);
            genAiFilterConfigGr.addQuery('filter', filterId);
            genAiFilterConfigGr.addQuery('active', true);
            genAiFilterConfigGr.query();
            var assistantDocumnetId = "";
            while (genAiFilterConfigGr.next()) {
                assistantDocumnetId = genAiFilterConfigGr.getValue('document_id');
                var naDeploymentConfigGr = new GlideRecord(this.VA_DEPLOYMENT_CONFIG);
                var naDeploymentConfig = naDeploymentConfigGr.get('context_profile', assistantDocumnetId);
                if (naDeploymentConfig) {
                    activeVaCount++;
                    activeVa += (activeVa ? "," : "") + naDeploymentConfigGr.getDisplayValue('context_profile');
                }

            }
            return {
                activeVa: activeVa,
                activeVaCount: activeVaCount
            };
        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch active VA Assistants" + e.toString());
            return {};
        }
    },
    getSamplePhrasesByFilterId: function(filterId) {
        try {
            if (gs.nil(filterId)) {
                return null;
            }
            var result = [];
            var genAiSamplePhrasesGr = new GlideRecord(this.GEN_AI_SAMPLE_PHRASES);
            genAiSamplePhrasesGr.orderByDesc('sys_created_on');
            genAiSamplePhrasesGr.addQuery('filter', filterId);
            genAiSamplePhrasesGr.query();
            while (genAiSamplePhrasesGr.next()) {
                result.push({
                    sampleText: genAiSamplePhrasesGr.getValue('sample_text'),
                    isActive: genAiSamplePhrasesGr.getValue('active') === "1" ? true : false,
                    sysId: genAiSamplePhrasesGr.getValue('sys_id'),
                    sysCreatedOn: genAiSamplePhrasesGr.getValue('sys_created_on'),
                });
            }

            return result;

        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch sample phrase by filterId" + e.toString());
            return null;
        }
    },
    getFilterCbTopicId: function(filterId) {
        try {
            if (gs.nil(filterId)) {
                return null;
            }
            var genAIFilterGr = new GlideRecord(this.GEN_AI_FILTER);
            if (!genAIFilterGr.get(filterId)) {
                return null;
            }

            var errorTopic = genAIFilterGr.getValue('filter_error_topic');
            if (gs.nil(errorTopic)) {
                return null;
            }
            var csTopicGr = new GlideRecord(this.CS_TOPIC);
            if (!csTopicGr.get(errorTopic)) {
                return null;
            }

            return csTopicGr.getValue('cb_topic_id');

        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to fetch cb Tobic Id" + e.toString());
            return null;
        }

    },
    updateGenAIFilterDetails: function(filterId, filterDetails, vaConfiguration) {

        try {
            if ((gs.nil(filterDetails) && gs.nil(vaConfiguration)) || gs.nil(filterId)) {
                return null;
            }
            var props = {};

            if (vaConfiguration) {
                props['filter_configurations'] = JSON.stringify({
                    "assistant": vaConfiguration
                });
            } else {
                props['filter_name'] = filterDetails.name;
                props['description'] = filterDetails.description;
                props['filter_group_order'] = filterDetails.filterGroupOrder;
            }

            var result = this.ONE_EXTEND_GLIDE_UTIL.updateRecord(this.GEN_AI_FILTER, filterId, props);
            if (result) {
                return true;
            }
            return false;

        } catch (error) {

            gs.error("NowAssistGuardianFilterUtil : updateGenAIFilterDetails failed to update filter details" + error.toString());
            return null;
        }
    },
    deleteGenAISamplePhrase: function(sysId) {
        try {

            if (gs.nil(sysId))
                return null;

            var deleted = this.ONE_EXTEND_GLIDE_UTIL.deleteRecords(this.GEN_AI_SAMPLE_PHRASES, sysId);

            if (deleted) {
                return true;
            }
            return false;

        } catch (error) {
            gs.error("NowAssistGuardianFilterUtil: deleteGenAISamplePhrase failed to delete sample phrase" + error.toString());
            return null;
        }
    },
    updateGenAISamplePhrase: function(samplephrase) {
        try {
            if (gs.nil(samplephrase)) {
                return null;
            }

            var props = {};
            props['sample_text'] = samplephrase.sampleText;
            var result = this.ONE_EXTEND_GLIDE_UTIL.updateRecord(this.GEN_AI_SAMPLE_PHRASES, samplephrase.sysId, props);

            if (result) {
                return true;
            }
            return false;

        } catch (error) {
            gs.error("NowAssistGuardianFilterUtil : updateGenAISamplePhrase failed to update sample phrase" + error.toString());
            return null;
        }
    },
    addGenAISamplePhrase: function(samplephrase, filterId, cloneSysId) {
        try {
            if (gs.nil(cloneSysId) && gs.nil(filterId)) {
                return null;
            }
            var newPhraseData = {};
            newPhraseData['sample_text'] = samplephrase.sampleText;
            newPhraseData['type'] = samplephrase.isGenerated ? 'generated' : 'provided';
            newPhraseData['filter'] = filterId;
			newPhraseData['active'] = true;
            if (!gs.nil(cloneSysId)) {
                var clonedValuePairs = this.NAA_GLOBAL_SCOPED_UTIL._getValuePairsFromClonedRecord(this.GEN_AI_SAMPLE_PHRASES, cloneSysId, ["active", "filter", "sys_package"]);
                for (field in clonedValuePairs) {
                    newPhraseData[field] = clonedValuePairs[field];
                }
            }
            var result = this.ONE_EXTEND_GLIDE_UTIL.insertRecord(this.GEN_AI_SAMPLE_PHRASES, newPhraseData);
            if (result) {
                return true;
            }
            return false;

        } catch (error) {

            gs.error("NowAssistGuardianFilterUtil : addGenAISamplePhrase failed to update sample phrase " + error.toString());
            return null;
        }

    },
    updateDeploymentChannelStatus: function(deploymentChannel) {
        try {

            var props = {};
            props['active'] = deploymentChannel.isActive;
            var result = this.ONE_EXTEND_GLIDE_UTIL.updateRecord(this.VA_DEPLOYMENT_CHANNEL, deploymentChannel.sysId, props);

            if (result) {
                return true;
            }
            return false;

        } catch (error) {
            gs.error("NowAssistGuardianFilterUtil : updatedeploymentChannel failed to update VA Assistant " + error.toString());
            return null;
        }
    },
    activateAssistant: function(assistantId, filterId) {
        try {
            var naDeploymentConfigGr = new GlideRecord(this.VA_DEPLOYMENT_CONFIG);
            var naDeploymentConfigRecord = naDeploymentConfigGr.get('now_assist_deployment', assistantId);

            if (naDeploymentConfigRecord) {
                var vaContextProfile = naDeploymentConfigGr.getValue('context_profile');
                var result;
                var recordSysId = "";
                var genAiFilterConfigGr = new GlideRecord(this.GEN_AI_FILTER_CONFIG);
                genAiFilterConfigGr.addQuery('document_id', vaContextProfile);
                genAiFilterConfigGr.addQuery('filter', filterId);
                genAiFilterConfigGr.query();

                if (genAiFilterConfigGr.next()) {
                    recordSysId = genAiFilterConfigGr.getValue('sys_id');
                }
                if (recordSysId) {
                    result = this.ONE_EXTEND_GLIDE_UTIL.updateRecord(this.GEN_AI_FILTER_CONFIG, recordSysId, {
                        'active': true
                    });

                } else {
                    var filterConfig = {};
                    filterConfig['document_id'] = vaContextProfile;
                    filterConfig['document_table'] = 'sys_cs_context_profile';
                    filterConfig['active'] = true;
                    filterConfig['filter'] = filterId;

                    result = this.ONE_EXTEND_GLIDE_UTIL.insertRecord(this.GEN_AI_FILTER_CONFIG, filterConfig, {});
                }
                return result;
            }

        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to add active Virtual Assistant" + e.toString());

        }
        return false;
    },
    deactivateAssistant: function(assistantDocumnetId, filterId) {
        try {
            var genAiFilterConfigGr = new GlideRecord(this.GEN_AI_FILTER_CONFIG);
            genAiFilterConfigGr.addQuery('document_id', assistantDocumnetId);
            genAiFilterConfigGr.addQuery('filter', filterId);
            genAiFilterConfigGr.query();
            var recordSysId = "";
            if (genAiFilterConfigGr.next()) {
                recordSysId = genAiFilterConfigGr.getValue('sys_id');
            }

            var result = this.ONE_EXTEND_GLIDE_UTIL.updateRecord(this.GEN_AI_FILTER_CONFIG, recordSysId, {
                'active': false
            });


            return result;
        } catch (e) {
            gs.error("NowAssistGuardianFilterUtil : Unable to deactivate  Virtual Assistant" + e.toString());
            return false;
        }

    },
    changeFilterStatus: function(filterId, activate) {
        try {
            if (gs.nil(filterId) || gs.nil(activate)) {
                return null;
            }
            var props = {};
            props['active'] = activate;
            var result = this.ONE_EXTEND_GLIDE_UTIL.updateRecord(this.GEN_AI_FILTER, filterId, props);

            if (result) {
                return true;
            }
            return false;


        } catch (error) {
            gs.error("NowAssistGuardianFilterUtil : changeFilterStatus failed to update filter status" + error.toString());
            return null;
        }
    },
    handleSaveAndContinue: function(payload) {

        var page = payload.name;
        var res;
        if (page === 'getStarted') {
            res = this.updateGenAIFilterDetails(payload?.data?.filterId, payload?.data);
            var currFilterDetails = this.getGenAIFilterByFilterId(payload?.data?.filterId);
            return {
                currFilterDetails: currFilterDetails,
                filterId: payload?.data?.filterId
            };
        }
        if (page === 'samplePhrases') {
            var deletedPhrases = payload?.data?.deletedPhrases;
            var samplePhrases = payload?.data?.samplePhrases;
            var deleted = false;
            var updated = false;
            var created = false;
            if (deletedPhrases.length > 0) {

                for (let i = 0; i < deletedPhrases.length; i++) {
                    deleted = this.deleteGenAISamplePhrase(deletedPhrases[i].sysId);
                }
            }

            var clonePhraseSysId = samplePhrases[samplePhrases.length - 1].sysId;


            for (let i = 0; i < samplePhrases.length; i++) {
                if (samplePhrases[i].isEdited && !('isNew' in samplePhrases[i])) {
                    updated = this.updateGenAISamplePhrase(samplePhrases[i]);
                }
                if ('isNew' in samplePhrases[i]) {
                    created = this.addGenAISamplePhrase(samplePhrases[i], payload?.data?.filterId, clonePhraseSysId);
                }
            }


            res = {
                updated: updated,
                deleted: deleted,
                created: created
            };

            return res;

        }
        if (page === 'applicability') {
            var assistantData = payload?.data;
            var updatedVA = false;
            for (let i = 0; i < assistantData.length; i++) {
                if (assistantData[i].isActive) {
                    updatedVA = this.activateAssistant(assistantData[i].sysId, payload?.filterId);
                } else {
                    updatedVA = this.deactivateAssistant(assistantData[i].assistantDocumnetId, payload?.filterId);
                }
            }
            return updatedVA;

        }
        if (page == 'reviewPage') {
            return this.changeFilterStatus(payload?.filterId, true);
        }

    },
    handle: function() {
        if (this.BLOCK_CONTEXT != undefined && this.BLOCK_CONTEXT.guidexPagePayload != undefined) {
            var res = this.handleSaveAndContinue(this.BLOCK_CONTEXT.guidexPagePayload);
            return res;
        } else {
            var result = {};
            result = this.getGenAIFilterByFilterId(this.PAGE_PARAMS.filterId);
            result.virtualAgent = this.getActiveVADeploymentChannels(this.PAGE_PARAMS.filterId);

            return {
                currFilterDetails: result,
                filterId: this.PAGE_PARAMS.filterId,
                reviewButtonLabel: gs.getMessage('Activate'),
                isFilterActive: result.isActive,
                reviewButtonStyle: 'primary',
                isApplicablitySaveAndContinue: (result?.virtualAgent?.activeVaCount > 0) ? 'false' : 'true',
            };
        }
    },
    type: 'NowAssistGuardianFilterUtil'
};
