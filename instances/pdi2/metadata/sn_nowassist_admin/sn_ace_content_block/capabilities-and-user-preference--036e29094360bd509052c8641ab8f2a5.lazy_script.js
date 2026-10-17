(function(context, pageParams, blockcontext) {
    var capabilities = [];

    capabilities.push({
        "id": "now_assist_panel",
        "title": {
            "label": gs.getMessage("The Now Assist panel is a personal AI assistant that can help generate and summarize content to streamline how tasks are completed."),
            "tag": "p",
            "css": "*{ margin:0;}"
        },
        "description": {
            "visibility": false
        },
        "card_title": {
            "visibility": true,
            "tag": "p",
            "text": gs.getMessage("Enhance work with an AI powered assistant"),
            "css": "*{margin:0.75rem; color: rgb(var(--now-color_text--primary));  font-size: 1rem; font-weight: var(--now-display-type--primary--font-weight); }}"
        },
        "banner": {
            "visibility": true,
            "source": "sn_nowassist_admin.now-assist-assistant.svg",
            "imageFit": "cover"
        },
        "image": {
            "visibility": false
        },
        "highlightedText": {
            "visibility": false
        },
        "action": {
            "visibility": false
        },
        "footer": {
            "visibility": true,
            "icon": false,
            "label": gs.getMessage("Note: Requires plugin install")
        },
        "skills": {
            "visibility": false
        },
        "noSkills": {
            "visibility": false
        }
    });
    capabilities.push({
        "id": "features_skills",
        "title": {
            "label": gs.getMessage("Now Assist skills can improve user productivity and simplify processes so the focus is on problem solving."),
            "tag": "p",
            "css": "*{margin:0; margin-bottom: 1rem;}"
        },
        "description": {
            "visibility": false
        },
        "card_title": {
            "visibility": true,
            "tag": "h4",
            "text": gs.getMessage("Improve productivity with Now Assist skills"),
            "css": "*{margin:0.75rem; color: rgb(var(--now-color_text--primary));  font-size: 1rem; font-weight: var(--now-display-type--primary--font-weight); }}"
        },
        "banner": {
            "visibility": true,
            "source": "sn_nowassist_admin.now-assist-skills-improve-productivity.svg",
            "imageFit": "cover"
        },
        "image": {
            "visibility": false
        },
        "highlightedText": {
            "visibility": false
        },
        "action": {
            "visibility": false
        },
        "footer": {
            "visibility": true,
            "icon": false,
            "label": gs.getMessage("Note: Requires plugin install")
        },
        "skills": {
            "visibility": false
        },
        "noSkills": {
            "visibility": false
        }
    });
    capabilities.push({
        "id": "helpful_resources",
        "title": {
            "label": gs.getMessage("A checklist will guide you throughout your journey in activating Now Assist skills that make work easier."),
            "tag": "p",
            "css": "*{margin:0; margin-bottom: 1rem}"
        },
        "description": {
            "visibility": false
        },
        "card_title": {
            "visibility": true,
            "tag": "h4",
            "text": gs.getMessage("Track your Now Assist journey"),
            "css": "*{margin:0.75rem; color: rgb(var(--now-color_text--primary));  font-size: 1rem; font-weight: var(--now-display-type--primary--font-weight); }}"
        },
        "banner": {
            "visibility": true,
            "source": "sn_nowassist_admin.now-assist-track-journey.svg",
            "imageFit": "fill"
        },
        "image": {
            "visibility": false
        },
        "highlightedText": {
            "visibility": false
        },
        "action": {
            "visibility": false
        },
        "footer": {
            "visibility": true,
            "icon": " ",
            "label": " "
        },
        "skills": {
            "visibility": false
        },
        "noSkills": {
            "visibility": false
        }
    });

    var pluginData = NAAWorkFlowFeatureUtil.getWorkflowPluginDataForHomePage();
    var isBuPluginInstalled = NAAPluginUtil.isBuPluginInstalled();
    var title = "";
    var firstName= gs.getUser().getFirstName() || gs.getUserDisplayName();
    if (isBuPluginInstalled) {
        title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Welcome back, {firstName} !", {firstName: firstName});
    } else {
        title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Welcome to Now Assist Admin, {firstName} !", {firstName: firstName});
    }

    var modalViewed = gs.getUser().getPreference('NOW_ASSIST_ONBOARDING_MODEL');
    var showOnboardingVideo = true;
    var showOnboardingCapabilities = false;
    var showOnboardingAdminJourney = false;
    if (modalViewed == 'true') {
        showOnboardingVideo = false;
    }
    //Show Feedback Modal
    var showFeedbackModal = NAAFeedbackUtil.displayProductFeedbackModal(gs.getUserID());

    //Now Assist KPI Enabled
    var lastSyncUpTime = NAASkillConfigUtil.lastSyncUpTime();
    var dashboardId = NAASkillConfigUtil.getDashboardId();
    var bannerDescription = gs.getMessage("Set up Now Assist generative AI skills to enhance your org’s workflows.");
    if (isBuPluginInstalled) {
        bannerDescription = gs.getMessage("Here’s a snapshot of Now Assist.");
    }

    //Now Assist panel Enabled
    var showNowAssistPanel = false;
    var configUtil = new sn_nowassist_admin.NowAssistConfig();
    var disableNAP = NAANowAssistPanelUtil.disableTurnOnNAP();
    if (!disableNAP) {
        var isNowAssistPanelEnabled = configUtil.isNowAssistPanelEnabled();
        showNowAssistPanel = !isNowAssistPanelEnabled;
    }

    //plugin list
    var targetAvailablePluginsList = pluginData.needsAttentionPluginList;

    var count = targetAvailablePluginsList.length;
    var pluginViz = count != 0;

    //Total Count
    var skillsRes = NAASkillConfigUtil.getNotActiveSkills();
    var skillCount = skillsRes.count + skillsRes.draftCount + skillsRes.notConfigCount;


    var pluginCount = targetAvailablePluginsList.length;
    var totalCount = skillCount + pluginCount;
    var showText = totalCount != 0;

    //no active skills
    skillList = skillsRes.skillList;

    var len = skillList.length;

    return {
        capabilities: capabilities,
        modalViewed: modalViewed,
        title: title,
        showOnboardingVideo: showOnboardingVideo,
        showOnboardingCapabilities: showOnboardingCapabilities,
        showOnboardingAdminJourney: showOnboardingAdminJourney,
        showNowAssistKPI: isBuPluginInstalled,
        showWatchAndLearnCard: !isBuPluginInstalled,
        bannerDescription: bannerDescription,
        lastSyncTime: lastSyncUpTime,
        dashboardSysId: dashboardId,
        showNowAssistPanel: showNowAssistPanel,
        needsAttentionPluginList: pluginData.needsAttentionPluginList,
        accordionMessage: pluginData.accordionMessage,
        pluginsList: targetAvailablePluginsList,
        pluginsCount: count,
        pluginText: pluginData.accordionMessage,
        pluginViz: pluginViz,
        total: totalCount,
        show: showText,
        zeroVis: !showText,
        skillList: skillList,
        draftSkillList: skillsRes.draftSkillList,
        notConfigSkillList: skillsRes.notConfigSkillList,
        skillCount: len,
        draftCount: skillsRes.draftCount,
        notConfigCount: skillsRes.notConfigCount,
        skillsText: skillsRes.skillsMsg,
        draftSkillMsg: skillsRes.draftSkillMsg,
        notConfigMsg: skillsRes.notConfigMsg,
        showSkill: len != 0,
        showDraftSkill: skillsRes.draftCount != 0,
        shownotConfigSkill: skillsRes.notConfigCount != 0,
        showAdminJourneyCard: !isBuPluginInstalled,
        showAdminJourneyCardRightPanel: isBuPluginInstalled,
        timestamp: Date.now(),
        showConversationalExperienceCard: !isBuPluginInstalled,
        showFeedbackModal: showFeedbackModal
    };
})(context, pageParams, blockcontext);
