function transform(input) {
    try {
        var sbNaaUtil = new sn_nowassist_admin.SkillBuilderNaaUtils();

        var skillConfigData = NAASkillConfigUtil._getSkillConfiguration(input?.skillConfigId);
        var hideTurnOnNAPBanner = NAANowAssistPanelUtil.disableTurnOnNAP() || !skillConfigData?.enable_nap;

        var selectedCE = [];
        var ceList = [];
        //Check if NAP is active
        var napObj = {
            "id": "nap",
            "label": "Now Assist Panel"
        };
        var vaObj = {
            "id": "va",
            "label": "Virtual Agents"
        };

        if (skillConfigData?.nap_status?.nowAssistPanelEnabled && skillConfigData?.enable_nap) {
            ceList.push(napObj);
        }
        if (skillConfigData?.nap_status?.nowAssistPanelEnabled && skillConfigData?.enable_nap && skillConfigData?.nap_active ) {
            selectedCE.push(napObj);
        }
        //Check if VA is active

        if (skillConfigData?.show_va_card) {
            ceList.push(vaObj);
        }
        if (skillConfigData?.va_active) {
            selectedCE.push(vaObj);
        }

        var result = sbNaaUtil.getConfiguredChatExperiences(input.skillConfigId, false);
        let selectedVAList = result.map(item => ({
            id: item.contextProfileId,
            label: item.contextProfileName
        }));

        var vaList = sbNaaUtil.getVADeploymentChannels();

        return {
            vaList: vaList,
            selectedVAList: selectedVAList,
            selectedCE: selectedCE,
            ceList: ceList,
            napEnabled: skillConfigData?.nap_status?.nowAssistPanelEnabled && skillConfigData?.napSkillAppl,
            hideTurnOnNAPBanner: hideTurnOnNAPBanner
        };

    } catch (error) {
        gs.error("Error occurred in Get Virtual Agents list data broker :" + error.toString());
    }
}
