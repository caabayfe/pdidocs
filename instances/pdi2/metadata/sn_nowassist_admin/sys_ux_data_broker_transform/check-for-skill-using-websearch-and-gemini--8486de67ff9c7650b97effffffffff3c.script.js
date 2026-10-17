function transform(input) {
    try {
        var showAlert = NAASkillConfigUtil.checkIfSkillUsingWebSearchForAlert(input.associatedCapabilityAndGenAiProviderMap);

        var url = '<a href="https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB2596322">KB2596322</a>';
        var warningMessage = '<div>' + sn_i18n.Message.getMessage("sn_nowassist_admin", "Certain ServiceNow skills utilize API features that process data via third-party providers, and these providers may route traffic to a datacenter outside of your region or location for these API features. See {url} for a list of third-party APIs and the skills utilizing those third-party APIs. Please review the KB on how traffic is routed by these APIs to ensure processing aligns with your organization's policies.", {
                url: url
            }) +
            '</div>';

        return {
            showAlert: showAlert,
            warningMessage: warningMessage
        };
    } catch (e) {
        gs.error("Failed fetch Check For Skill using Websearch and Gemini - " + e);
        throw new Error("Failed fetch Check For Skill using Websearch and Gemini");
    }
}
