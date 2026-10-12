(function(context, pageParams, blockcontext) {
    var formattedPayload = [];
    var pendingSkillsCardData = [];
    var rejectedSkillsCardData = [];
    var skills = Object.values(NAASkillConfigUtil.getSkillSuperObject(NAAConstant.OTHER_WORKFLOW_ID)).filter(skill => !skill.active);
    var skillConfigList = skills.map(skill => skill.id);

    var one_extend_data = NAAGenAIUtil.getOneExtendDefConfigData();
    var skill_config_m2m_data = NAAGenAIUtil.getSkillConfM2MData(skillConfigList);

    var aictStatus = {};
    var aictCheck = false;
    var allowedProviders = NAAManageLLMAPI.getAllowedProviders();
    var nonCompliantSkills = NAASkillConfigUtil.getNonComplaintSkills(allowedProviders, false, false, NAAConstant.OTHER_WORKFLOW_ID).map(skill=> skill.id);
    var isFallbackEnabled = allowedProviders.fallback;
    var blockerNCText = sn_i18n.Message.getMessage("sn_nowassist_admin", "The skill is disabled as it is not compliant per your model provider policy. Please review policy for details");
    var warnNCText = sn_i18n.Message.getMessage("sn_nowassist_admin", "The skill is using an non-compliant model provider. Review policy to see list of approved providers");
	var ltsRemovedText = sn_i18n.Message.getMessage("sn_nowassist_admin", "The skill is using an unsupported model provider. Please contact AI steward to update.");
	var isLTSRemoved = gs.getProperty('sn_generative_ai.is_lts_supported') === 'false';

    if (NAAGovernanceUtil.isAICTEnabled()) {
        aictCheck = true;
        var skillConfigList = skills.map(skill => skill.id);
        aictStatus = NAAGovernanceUtil.getAICTStatusBySkillList(skillConfigList);
    }

	skills.forEach(function(skill) {
            var id = skill.id;
            var providerData = NAAGenAIUtil.getProvider(one_extend_data, skill_config_m2m_data, skill, id);
            skill['provider_data'] = providerData;
        });
    skills = NAASkillConfigUtil._pruneSkillsByRoutingMatrix(skills);

    skills.forEach(function(skill) {
        var id = skill.id;
        var nonCompliantType = nonCompliantSkills.includes(id) ? (isFallbackEnabled ? 'warn' : 'block') : 'none';
		
        buttonLabel = gs.getMessage('Activate skill');
        buttonAriaConfig = gs.getMessage('Activate skill for {0}', skill.label);
        var state = skill.state;
        var highlightLabel;
        var colour;
        var res = NAASkillConfigUtil.getSkillDetails(state);
        var providerData = NAAGenAIUtil.getProvider(one_extend_data, skill_config_m2m_data, skill, id);
        var skillProviderIds = providerData?.skillConfigGenAiProviderIds ? providerData?.skillConfigGenAiProviderIds:[];
        var showLTSRemovedText = isLTSRemoved && skillProviderIds.includes(NAAConstant.GEN_AI_PROVIDER_NOW_LLM_LTS);
        showLTSRemovedText && (nonCompliantType = 'block');
       
         var skillProvider = [...providerData["skillConfigLlmSet"]].join(',');
        var disableActionButton = aictCheck && state !== "inactive" && aictStatus[id]?.canActivate === false;
        var aicLabels = aictCheck ? NAAGovernanceUtil.getAICTSkillDetails(aictStatus[id]) : "";
        highlightLabel = disableActionButton ? aicLabels['highlightLabel'] : res['label'];
        color = disableActionButton ? aicLabels['highlightColor'] : res['colour'];

        var label = skill.label;
        var description = skill.description;
        if (!skill.has_var_set) {
            buttonLabel = gs.getMessage('Turn on');
            buttonAriaConfig = gs.getMessage('Turn on skill for {0}', skill.label);
        }

        var moreActionsItems = {
            id: "duplicate",
            skillId: skill.id,
            skillName: label,
            domain: skill.sys_domain,
            label: gs.getMessage("Make a copy")
        };

        var aictStatusType = (aictCheck && state != "inactive") ? aictStatus[id]?.status : state;
        var highlightedText = [{
                "visibility": true,
                "label": gs.getMessage("Custom"),
                "color": "magenta",
                "icon": ""
            },
            {
                "visibility": true,
                "label": highlightLabel,
                "color": color,
                "icon": ""
            }
            ]
             if (skillProvider != "" && skillProvider != "undefined") {
                highlightedText.push({
                    "visibility": true,
                    "label":  skillProvider,
                    "color": "gray"
                });
            }
        var cardData = {
            "id": id,
            "has_var_set": skill.has_var_set,
            "nap_skill_applicability": skill.nap_skill_applicability,
            "success_message": gs.getMessage('{0}', skill.success_message),
            "title": {
                "label": label,
                "tag": "p",
                "css": "*{margin:0;font-size:16px;font-weight:600;color:rgb(var(--now-color_text--secondary);}"
            },
            "description": {
                "visibility": !gs.nil(description) ? true : false,
                "label": description,
                "css": {
                    "margin": "0",
                    "font-size": "12px",
                    "color": "rgb(var(--now-color_text--tertiary)"
                }
            },
            "card_bg_color": disableActionButton && aictStatus[id]?.status === 'rejected' ? aicLabels.cardBgColor : '',
            "card_title": {
                "visibility": false
            },
            "banner": {
                "visibility": false,
            },
            "image": {
                "visibility": false,
            },
            "highlightedText": highlightedText ,
            "action": {
                "variant": "secondary",
                "label": buttonLabel,
                "disabled": ((!disableActionButton && skill.can_write == true) ? false : true) || nonCompliantType == 'block',
                "visibility": true,
                "configAria": {
                    "aria-label": buttonAriaConfig
                },
                "toolTipMsg": buttonLabel
            },
            "moreActions": skill.is_template ? {
                "visibility": true,
                "variant": "secondary",
                "items": moreActionsItems,
                "configAria": {}
            } : {},
            "footer": {
                "visibility": disableActionButton,
                "icon": aicLabels.labelIcon,
                "label": aicLabels.label,
            },
            "skills": {
                "visibility": false
            },
            "noSkills": {
                "visibility": false
            },
            "blockerNCText": showLTSRemovedText? ltsRemovedText : blockerNCText,
            "warnNCText": warnNCText,
            "domain": skill.sys_domain,
            "sys_overrides": skill.sys_overrides,
            "nonCompliantType": nonCompliantType,
			"allowEditingRMRoles": skill.type !== "oob" || skill.edited_in_nask || !!skill.parent
        };

        switch (aictStatusType) {
            case "rejected":
                rejectedSkillsCardData.push(cardData);
                break;
            case "needs_review":
            case "in_review":
                pendingSkillsCardData.push(cardData);
                break;
            default:
                formattedPayload.push(cardData);
        }
    });

	var sessionDomain = gs.getSession().getCurrentDomainID();
	var sessionDomainName = "";

	if (sessionDomain) {
		sessionDomainName = NAADomainUtil.getDomainName(sessionDomain);
	} else {
		sessionDomain = "global";
		sessionDomainName = "Global";
	}

    return {
        aictCheck: aictCheck,
        formattedPayload: formattedPayload,
        availableSkillsCount: formattedPayload.length,
        showAvailableSkills: formattedPayload.length > 0,
        showNoAvailableSkillsError: formattedPayload.length === 0,
        availableTabLabel: sn_i18n.Message.getMessage("sn_nowassist_admin", "Available"),

        pendingSkillsCardData: pendingSkillsCardData,
        pendingSkillsCount: pendingSkillsCardData.length,
        showPendingSkills: pendingSkillsCardData.length > 0,
        showNoPendingSkillsError: pendingSkillsCardData.length === 0,
        pendingTabLabel: sn_i18n.Message.getMessage("sn_nowassist_admin", "Pending review"),
        nonCompliantSkills: nonCompliantSkills,
        isFallbackEnabled: isFallbackEnabled,
        rejectedSkillsCardData: rejectedSkillsCardData,
        rejectedSkillsCount: rejectedSkillsCardData.length,
        showRejectedSkills: rejectedSkillsCardData.length > 0,
        showNoRejectedSkillsError: rejectedSkillsCardData.length === 0,
        rejectedTabLabel: sn_i18n.Message.getMessage("sn_nowassist_admin", "Rejected"),

        activateLoaderLabel: sn_i18n.Message.getMessage("sn_nowassist_admin", "Activating skill"),

		sessionDomain: sessionDomain,
		sessionDomainName: sessionDomainName,
    };
})(context, pageParams, blockcontext);
