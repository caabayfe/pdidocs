var NAASkilConfigActivateToggler = {

    deActivateSkillConfig: function(skillConfigId, updateNAP = true) {
        if (gs.nil(skillConfigId)) {
            throw new Error(NAAConstant.NULL_SKILL_CONFIG_ID_MESSAGE);
        }

        var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);

        var skillConfigStatus = NAASkillConfigUtil._getSkillConfigStatus(skillConfigId);

        if (skillConfigGr.get(skillConfigId) && NAARoleUtil._hasEditAccess(skillConfigGr)) {
            var deactivated = null;

            if (!gs.nil(skillConfigStatus)) {
                skillConfigStatus.active = false;
                skillConfigStatus.in_product_active = false;
                skillConfigStatus.in_mobile_active = false;
                if (NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigId, skillConfigStatus)) {
                    deactivated = skillConfigId;
                }
            } else {
                var skillConfigStatusData = {};
                skillConfigStatusData.active = false;
                skillConfigStatusData.in_product_active = false;
                skillConfigStatusData.in_product_roles = skillConfigGr.getValue('in_product_roles');
                var skillConfigStatusId = NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigId, skillConfigStatusData);
                deactivated = gs.nil(skillConfigStatusId) ? false : true;
            }

            if (!gs.nil(deactivated) && updateNAP) {
                var genAiSkillApplicabilities = NAANowAssistPanelUtil.getNAPSkillApplicabilities(skillConfigGr);

                if (genAiSkillApplicabilities && !NAAGenAIUtil.updateGenAISkillApplicability(genAiSkillApplicabilities, {
                        active: false
                    })) {
                    return {
                        update: false
                    };
                }
            }

            var errorMessage = "";
            if (gs.nil(deactivated)) {
                if (gs.getErrorMessages() && gs.getErrorMessages().length > 0) {
                    errorMessage = gs.getErrorMessages()[0];
                    NAAConstant.NAA_GLOBAL_SCOPED_UTIL.clearErrorMessages && NAAConstant.NAA_GLOBAL_SCOPED_UTIL.clearErrorMessages();
                }
            }
            var deactivatedObj = {
                update: deactivated,
                message: errorMessage
            };

            NAAGuidedSetupUtil._upsertGuidedSetupStatus(skillConfigId, "", false);
            return deactivatedObj;
        }
        return {
            update: false
        };
    },

    /**
     * 
     */
    _deactivateAllSkills: function(skillConfigGr) {
        //deactivate all the skills if the current skill has parent
        var currSkillConfigId = gs.nil(skillConfigGr.getValue('parent')) ? skillConfigGr.getUniqueValue() : skillConfigGr.getValue('parent');
        var deactivateSkillConfingsGr = new GlideRecord(NAAConstant.SKILL_CONFIG);
        deactivateSkillConfingsGr.addQuery('parent', currSkillConfigId).addOrCondition('sys_id', currSkillConfigId);
        deactivateSkillConfingsGr.query();

        while (deactivateSkillConfingsGr.next()) {
            var deactivateSkillConfigStatus = NAASkillConfigUtil._getSkillConfigStatus(deactivateSkillConfingsGr.getUniqueValue());
            if (!gs.nil(deactivateSkillConfigStatus)) {
                if (deactivateSkillConfigStatus.active == "1")
                    NAASkilConfigActivateToggler.deActivateSkillConfig(deactivateSkillConfingsGr.getUniqueValue());
            } else { //no status record created yet, check active flag in skill config record
                if (deactivateSkillConfingsGr.getValue('active') == "1")
                    NAASkilConfigActivateToggler.deActivateSkillConfig(deactivateSkillConfingsGr.getUniqueValue());
            }
        }
    },

    activateSkillConfig: function(skillConfigId, hasVarSet) {
        if (gs.nil(skillConfigId))
            throw new Error(NAAConstant.NULL_SKILL_CONFIG_ID_MESSAGE);
        var skillConfigGr = new GlideRecord(NAAConstant.SKILL_CONFIG);

        if (skillConfigGr.get(skillConfigId)) {

            NAASkilConfigActivateToggler._deactivateAllSkills(skillConfigGr);

            var skillConfigStatus = NAASkillConfigUtil._getSkillConfigStatus(skillConfigId);
            var activated = null;
            var skillConfigData = {
                active: true
            };

            // Add additional fields if `hasVarSet` is false
            if (!hasVarSet) {
                skillConfigData.in_product_active = true;
                if (gs.nil(skillConfigStatus)) {
                    skillConfigData.in_product_roles = skillConfigGr.getValue('in_product_roles');
                }
                var genAiSkillApplicabilities = NAANowAssistPanelUtil.getNAPSkillApplicabilities(skillConfigGr);
                if (!gs.nil(genAiSkillApplicabilities)) {
                    NAAGenAIUtil.updateGenAISkillApplicability(genAiSkillApplicabilities, {
                        active: true
                    });
                }
            }

            var upsertResult = NAASkillConfigManipulatorUtil.upsertSkillConfigStatus(skillConfigId, skillConfigData);
            activated = gs.nil(skillConfigStatus) ? !gs.nil(upsertResult) : (upsertResult ? skillConfigId : activated);
            //BPK : activated is not always Boolean


            //Activate offensiveness for the skill if exists for the product/workflow
            var skillConfig = NAASkillConfigUtil.getSkillConfig(skillConfigId);
            var productId = gs.nil(skillConfig?.skill_family_parent) ? skillConfig?.skill_family : skillConfig.skill_family_parent;

            var detectionImpact = (NAAConstant.NAA_GUARDRAILS.getDetectionImpact(NAASkillConfigUtil.getSkillsOfProduct(productId), NAAConstant.CONSTANTS.NOW_ASSIST_GUARDIAN.OFFENSIVENESS_TYPE))?.detectionImpact;
            if (detectionImpact === NAAConstant.CONSTANTS.NOW_ASSIST_GUARDIAN.MONITOR || detectionImpact === NAAConstant.CONSTANTS.NOW_ASSIST_GUARDIAN.BLOCK) {
                NAAConstant.NAA_GUARDRAILS.setActiveControl(skillConfigId, detectionImpact, NAAConstant.CONSTANTS.NOW_ASSIST_GUARDIAN.OFFENSIVENESS_TYPE);
            }

            var errorMessage = "";
            if (gs.nil(activated)) {
                if (gs.getErrorMessages() && gs.getErrorMessages().length > 0) {
                    errorMessage = gs.getErrorMessages()[0];
                    NAAConstant.NAA_GLOBAL_SCOPED_UTIL.clearErrorMessages && NAAConstant.NAA_GLOBAL_SCOPED_UTIL.clearErrorMessages();
                }
            }
            var activatedObj = {
                update: activated,
                message: errorMessage
            };

            return activatedObj;
        }
        return {
            update: false
        };
    },

	/**
	 * List if skills to be deactivated.
	 * If the user is in children domain, and if we want to deactivate the skill in children domain, we will have to override the skill in children domain
	 * Then deactivate the skill
	 * @param skills - List of skills to be deactivated.
	 * [
	 * 	  {
	 * 		id: "skill-config-id",
	 * 		domain: "skill config domain"
	 * 	  }
	 * ]
	 */
	deactivateNonComplaintSkills: function(skills){
		var sessionDomain = gs.getSession().getCurrentDomainID() || "global";
        
		var domainSeparationEnabled = NAADomainUtil.isRecordDomainSeparationEnabled();
		var listOfSkillToBeDeactivated=[];
		skills.forEach(item=>{
			if(domainSeparationEnabled){
				if(sessionDomain===item.domain){
					listOfSkillToBeDeactivated.push(item.id);
				}else{
					var newSkillConfigInChildrenDomain = NowAdminAssistUtil.duplicateSkillAPI(item.id, true, sessionDomain);
						if(newSkillConfigInChildrenDomain){
							listOfSkillToBeDeactivated.push(newSkillConfigInChildrenDomain.body.newSkillConfigId);
					}
				}
			}else{
				listOfSkillToBeDeactivated.push(item.id);
			}
		});
        
		listOfSkillToBeDeactivated.forEach(skillConfigId=>{
			NAASkilConfigActivateToggler.deActivateSkillConfig(skillConfigId);
		});

		return true;
	},

    type: 'NAASkilConfigActivateToggler'
};
