/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    api.setState("duplicatingSkill", true);
    helpers.snHttp('/api/sn_nowassist_admin/now_assist_admin_console_api/util', {
        method: 'POST',
        body: {
            operation: "DUPLICATE_SKILL",
            skillConfigId: api.state.skillConfigData.sys_id,
            isDomainDifferent: true,
            domainId: api.state.userSessionDomainDetails.domainId
        }
    }).then(response => {
        api.emit("NAV_ITEM_SELECTED", {
            reload: true,
            route: 'skill-guided-setup',
            fields: {
                "skillConfig": response.response.result.newSkillConfigId
            }
        });
    }).catch(response => {
        api.setState("duplicatingSkill", false);
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "skill_duplicate_error",
                status: "critical",
                icon: "info-circle-outline",
                content: api.state.skillConfigData.translated_text.commonError,
                action: {
                    type: "dismiss"
                }
            }]
        });
        console.error(response.error);
    });
}
