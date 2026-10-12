/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let blockcontext = api.state.blockcontext;
    //update blockcontext as per your business logic.
    api.emit('ACE_PAGE_READY', {blockcontext});
    var nonCompliantSkills = blockcontext.availableSkillsCardData.filter(data=>blockcontext.nonCompliantSkills.includes(data.id))
    if(nonCompliantSkills.length > 0) {
        var icon = blockcontext.isFallbackEnabled ? 'info-circle-outline' : 'exclamation-triangle-outline';
        var status = blockcontext.isFallbackEnabled ? 'warning' : 'critical';
        var content = blockcontext.isFallbackEnabled ? await helpers.translate("{0} custom skills use non-compliant model providers", nonCompliantSkills.length) : await helpers.translate("{0} custom skills use non-compliant model providers, and fallback is off", nonCompliantSkills.length)
        api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
            items: [{
                id: "non_compliant_skills",
                status: status,
                icon: icon,
                content: content,
                header: await helpers.translate("Non-compliant skills"),
                action: {
                    type: "dismiss"
                },
                textLinkProps:{
                    label: await helpers.translate('Review model provider policy'),
                    href: 'now/now-assist-admin/manage-llm-providers'
                }
                
            }]
        });
    }
}
