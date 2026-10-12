const napDeploymentID = '7bd9820f14475650f87711349c1171be';
const napSearchProfileID = '61cf241a77fcb110569156391e5a994b';
const playbookSearchSourceID = '1118a568ffc24b10c4c9ffffffffff5e';
var playbookSkillEnabled;

try {
	playbookSkillEnabled = new sn_nowassist_va.NowAssistDeploymentChannelHelper().isIntegratedChatEnabledForAssistant(napDeploymentID);
} catch (err) {
	gs.error("Unable to validate if NAP has premium chat active: " + err);
	playbookSkillEnabled = false;
}

updateConfigAttribute(napDeploymentID, 'playbook_skill_enabled', playbookSkillEnabled);
mapPlaybookSearchSource(playbookSkillEnabled);

try {
    new sn_ais_assist.AISNowAssistAPI()._publishProfile(napSearchProfileID);
} catch (err) {
    gs.error("Unable to publish search profile: " + err);
}

function mapPlaybookSearchSource(assignToAssistant) {
    var searchSourceM2MGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
    searchSourceM2MGr.addQuery('profile', napSearchProfileID);
    searchSourceM2MGr.addQuery('search_source', playbookSearchSourceID);
    searchSourceM2MGr.query();

    if (searchSourceM2MGr.next()) {
        if (!assignToAssistant) {
            searchSourceM2MGr.deleteRecord();
        }
        return;
    }
    if (assignToAssistant) {
        searchSourceM2MGr.initialize();
        searchSourceM2MGr.setValue('profile', napSearchProfileID);
        searchSourceM2MGr.setValue('search_source', playbookSearchSourceID);
        searchSourceM2MGr.insert();
    }
}

function updateConfigAttribute(assistantId, attributeName, value) {
    var configAttributesGr = new GlideRecord('sys_now_assist_deployment_config_attributes');
    configAttributesGr.addQuery('name', attributeName);
    configAttributesGr.addQuery('deployment_config.now_assist_deployment', assistantId);
    configAttributesGr.query();
    if (configAttributesGr.next()) {
        configAttributesGr.setValue('value', value);
        configAttributesGr.update();
    }
}
